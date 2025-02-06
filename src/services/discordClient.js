const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("../config/config");

console.log("Initializing Discord Bot...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
  client.user.setPresence({
    activities: [
      {
        name: "api.audibert.rest",
        type: ActivityType.Playing,
      },
    ],
  });
});

client.on("error", (error) => {
  console.error("Error in client:", error);
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error("Login failed:", error);
});

module.exports = client;
