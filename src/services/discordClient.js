const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("../config/config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`${client.user.tag} online!`);
  client.user.setPresence({
    activities: [
      {
        name: "grux.audibert.dev",
        type: ActivityType.Watching,
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
