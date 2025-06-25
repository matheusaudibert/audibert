const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("../config/config");
const websocketServer = require("./websocketServer");
const {
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");

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

client.on("presenceUpdate", (oldPresence, newPresence) => {
  const userId = newPresence.userId;

  const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
  if (!mainGuild || !mainGuild.members.cache.has(userId)) {
    return;
  }

  const activities = newPresence?.activities || [];
  const spotifyActivity = processSpotifyActivity(activities);
  const generalActivity = processGeneralActivities(activities);

  let userStatus = newPresence?.status || "invisible";
  if (userStatus === "offline") {
    userStatus = "invisible";
  }

  websocketServer.broadcastPresenceUpdate(
    userId,
    userStatus,
    spotifyActivity,
    generalActivity
  );
});

client.on("error", (error) => {
  console.error("Error in client:", error);
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error("Login failed:", error);
});

module.exports = client;
