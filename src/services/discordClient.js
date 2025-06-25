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

// Cache para rastrear estados anteriores
const presenceCache = new Map(); // userId -> lastPresence

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

  // Monitoramento contínuo para detectar mudanças que o presenceUpdate pode perder
  setInterval(() => {
    checkAllPresences();
  }, 5000); // Verifica a cada 5 segundos
});

function checkAllPresences() {
  const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
  if (!mainGuild) return;

  mainGuild.members.cache.forEach((member) => {
    if (member.user.bot) return;

    const userId = member.user.id;
    const currentPresence = member.presence;
    const cachedPresence = presenceCache.get(userId);

    // Verificar se houve mudanças
    if (hasPresenceChanged(cachedPresence, currentPresence)) {
      presenceCache.set(userId, serializePresence(currentPresence));
      broadcastPresenceUpdate(userId, currentPresence);
    }
  });
}

function hasPresenceChanged(oldPresence, newPresence) {
  const oldSerialized = serializePresence(oldPresence);
  const newSerialized = serializePresence(newPresence);

  return JSON.stringify(oldSerialized) !== JSON.stringify(newSerialized);
}

function serializePresence(presence) {
  if (!presence) return null;

  return {
    status: presence.status,
    activities:
      presence.activities?.map((activity) => ({
        name: activity.name,
        type: activity.type,
        details: activity.details,
        state: activity.state,
        timestamps: activity.timestamps,
        assets: activity.assets,
        syncId: activity.syncId,
        createdTimestamp: activity.createdTimestamp,
      })) || [],
  };
}

function broadcastPresenceUpdate(userId, presence) {
  const activities = presence?.activities || [];
  const spotifyActivity = processSpotifyActivity(activities);
  const generalActivity = processGeneralActivities(activities);

  let userStatus = presence?.status || "invisible";
  if (userStatus === "offline") {
    userStatus = "invisible";
  }

  websocketServer.broadcastPresenceUpdate(
    userId,
    userStatus,
    spotifyActivity,
    generalActivity
  );
}

// Evento original do Discord.js (backup)
client.on("presenceUpdate", (oldPresence, newPresence) => {
  const userId = newPresence.userId;

  const mainGuild = client.guilds.cache.get(config.MAIN_GUILD);
  if (!mainGuild || !mainGuild.members.cache.has(userId)) {
    return;
  }

  // Atualizar cache
  presenceCache.set(userId, serializePresence(newPresence));

  // Broadcast da mudança
  broadcastPresenceUpdate(userId, newPresence);
});

client.on("error", (error) => {
  console.error("Error in client:", error);
});

client.on("disconnect", () => {
  console.warn("Discord client disconnected, attempting to reconnect...");
});

client.on("reconnecting", () => {
  console.log("Discord client reconnecting...");
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error("Login failed:", error);
});

module.exports = client;
