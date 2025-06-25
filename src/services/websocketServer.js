const WebSocket = require("ws");
const {
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.subscribedUsers = new Map(); // userID -> Set of WebSocket connections
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", (ws) => {
      console.log("New WebSocket connection established");

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
          ws.send(
            JSON.stringify({
              op: "error",
              d: { message: "Invalid message format" },
            })
          );
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
      ws.send(
        JSON.stringify({
          op: "hello",
          d: {
            heartbeat_interval: 30000,
            message: "Connected to Grux WebSocket",
          },
        })
      );
    });

    console.log("WebSocket server initialized");
  }

  handleMessage(ws, message) {
    const { op, d } = message;

    switch (op) {
      case "subscribe":
        if (d && d.user_id) {
          this.subscribeUser(ws, d.user_id);
        } else {
          ws.send(
            JSON.stringify({
              op: "error",
              d: { message: "user_id is required for subscribe" },
            })
          );
        }
        break;

      case "unsubscribe":
        if (d && d.user_id) {
          this.unsubscribeUser(ws, d.user_id);
        }
        break;

      case "heartbeat":
        ws.send(JSON.stringify({ op: "heartbeat_ack" }));
        break;

      default:
        ws.send(
          JSON.stringify({
            op: "error",
            d: { message: "Unknown operation" },
          })
        );
    }
  }

  subscribeUser(ws, userId) {
    if (!this.subscribedUsers.has(userId)) {
      this.subscribedUsers.set(userId, new Set());
    }

    this.subscribedUsers.get(userId).add(ws);

    ws.send(
      JSON.stringify({
        op: "subscribed",
        d: {
          user_id: userId,
          message: `Subscribed to receive presence updates for user ${userId}`,
        },
      })
    );

    console.log(`WebSocket subscribed to user: ${userId}`);
  }

  unsubscribeUser(ws, userId) {
    if (this.subscribedUsers.has(userId)) {
      this.subscribedUsers.get(userId).delete(ws);

      if (this.subscribedUsers.get(userId).size === 0) {
        this.subscribedUsers.delete(userId);
      }

      ws.send(
        JSON.stringify({
          op: "unsubscribed",
          d: { user_id: userId },
        })
      );
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
    const message = JSON.stringify(data);

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        connections.delete(ws);
      }
    });

    console.log(
      `Sent presence update to ${connections.size} client(s) for user: ${userId}`
    );
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
}

module.exports = new WebSocketServer();
