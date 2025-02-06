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
  console.log("Bot is online and ready!");

  // Agora que o bot está pronto, podemos iniciar o servidor Express
  require("../app").listen(config.PORT, () => {
    console.log(`API is running on port ${config.PORT}`);
  });
});

client.on("error", (error) => {
  console.error("Erro no client:", error);
});

client.login(config.DISCORD_TOKEN);

module.exports = client;
