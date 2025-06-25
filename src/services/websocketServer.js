const WebSocket = require("ws");
const {} = require("../utils/jsonProcessor");

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", (ws, req) => {
      console.log("New WebSocket connection established");

      // Extrair user ID da URL
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get("user_id");

      if (!userId) {
        ws.send(
          JSON.stringify({
            op: "error",
            d: { message: "user_id parameter is required" },
          })
        );
        ws.close();
        return;
      }

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId).add(ws);

      this.sendInitialData(ws, userId);

      ws.on("close", () => {
        this.removeConnection(ws, userId);
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    console.log("WebSocket server initialized");
  }

  async sendInitialData(ws, userId) {
    try {
      const response = await fetch(`https://grux.audibert.dev/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        ws.send(
          JSON.stringify({
            op: "initial_data",
            d: data.data,
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            op: "error",
            d: { message: "User not found or not monitored" },
          })
        );
        ws.close();
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      ws.send(
        JSON.stringify({
          op: "error",
          d: { message: "Failed to fetch user data" },
        })
      );
      ws.close();
    }
  }

  removeConnection(ws, userId) {
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).delete(ws);
      if (this.connectedUsers.get(userId).size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  broadcastPresenceUpdate(userId, status, spotifyActivity, generalActivity) {
    if (!this.connectedUsers.has(userId)) {
      return;
    }

    const data = {
      op: "presence_update",
      d: {
        status,
        spotify: spotifyActivity,
        activity: generalActivity,
      },
    };

    const connections = this.connectedUsers.get(userId);
    const deadConnections = [];

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(data));
        } catch (error) {
          console.error("Error sending message:", error);
          deadConnections.push(ws);
        }
      } else {
        deadConnections.push(ws);
      }
    });

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
      connected_users: this.connectedUsers.size,
      total_user_connections: Array.from(this.connectedUsers.values()).reduce(
        (total, connections) => total + connections.size,
        0
      ),
    };
  }
}

module.exports = new WebSocketServer();
