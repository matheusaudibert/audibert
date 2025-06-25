const WebSocket = require("ws");
const {
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.subscribedUsers = new Map(); // userID -> Set of WebSocket connections
    this.heartbeatInterval = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      perMessageDeflate: false,
      maxPayload: 1024 * 1024, // 1MB
    });

    this.wss.on("connection", (ws) => {
      console.log("New WebSocket connection established");

      // Configurar heartbeat para manter conexão viva
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
          this.sendSafe(ws, {
            op: "error",
            d: { message: "Invalid message format" },
          });
        }
      });

      ws.on("close", () => {
        this.unsubscribeAllUsers(ws);
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      // Send welcome message
      this.sendSafe(ws, {
        op: "hello",
        d: {
          heartbeat_interval: 30000,
          message: "Connected to Grux WebSocket",
        },
      });
    });

    // Heartbeat para detectar conexões mortas
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log("Terminating dead connection");
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    console.log("WebSocket server initialized");
  }

  sendSafe(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  }

  handleMessage(ws, message) {
    const { op, d } = message;

    switch (op) {
      case "subscribe":
        if (d && d.user_id) {
          this.subscribeUser(ws, d.user_id);
        } else {
          this.sendSafe(ws, {
            op: "error",
            d: { message: "user_id is required for subscribe" },
          });
        }
        break;

      case "unsubscribe":
        if (d && d.user_id) {
          this.unsubscribeUser(ws, d.user_id);
        }
        break;

      case "heartbeat":
        this.sendSafe(ws, { op: "heartbeat_ack" });
        break;

      default:
        this.sendSafe(ws, {
          op: "error",
          d: { message: "Unknown operation" },
        });
    }
  }

  subscribeUser(ws, userId) {
    if (!this.subscribedUsers.has(userId)) {
      this.subscribedUsers.set(userId, new Set());
    }

    this.subscribedUsers.get(userId).add(ws);

    this.sendSafe(ws, {
      op: "subscribed",
      d: {
        user_id: userId,
        message: `Subscribed to receive presence updates for user ${userId}`,
      },
    });

    console.log(`WebSocket subscribed to user: ${userId}`);
  }

  unsubscribeUser(ws, userId) {
    if (this.subscribedUsers.has(userId)) {
      this.subscribedUsers.get(userId).delete(ws);

      if (this.subscribedUsers.get(userId).size === 0) {
        this.subscribedUsers.delete(userId);
      }

      this.sendSafe(ws, {
        op: "unsubscribed",
        d: { user_id: userId },
      });
    }
  }

  unsubscribeAllUsers(ws) {
    for (const [userId, connections] of this.subscribedUsers.entries()) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.subscribedUsers.delete(userId);
      }
    }
  }

  broadcastPresenceUpdate(userId, status, spotifyActivity, generalActivity) {
    if (!this.subscribedUsers.has(userId)) {
      return;
    }

    const data = {
      op: "presence_update",
      d: {
        user_id: userId,
        status,
        spotify: spotifyActivity,
        activity: generalActivity,
        timestamp: Date.now(),
      },
    };

    const connections = this.subscribedUsers.get(userId);
    const deadConnections = [];

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendSafe(ws, data);
      } else {
        deadConnections.push(ws);
      }
    });

    // Remover conexões mortas
    deadConnections.forEach((ws) => connections.delete(ws));

    if (connections.size > 0) {
      console.log(
        `Sent presence update to ${connections.size} client(s) for user: ${userId}`
      );
    }
  }

  getStats() {
    return {
      total_connections: this.wss ? this.wss.clients.size : 0,
      subscribed_users: this.subscribedUsers.size,
      total_subscriptions: Array.from(this.subscribedUsers.values()).reduce(
        (total, connections) => total + connections.size,
        0
      ),
    };
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = new WebSocketServer();
