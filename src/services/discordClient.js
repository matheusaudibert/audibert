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
  console.error("Erro no client:", error);
});

client.login(config.DISCORD_TOKEN);

module.exports = client;
