const config = require("../config/config");
const defaultImages = require("../config/defaultImages");

const checkUserInGuilds = async (client, USER_ID) => {
  const GUILD_ID = process.env.GUILD_ID;
  let isUserFound = false;
  let member = null;

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    member = await guild.members.fetch(USER_ID);
    if (member) {
      isUserFound = true;
    }
  } catch (error) {}

  return { isUserFound, member };
};

function statusEmoji(activities) {
  const customStatus = activities.find(
    (activity) => activity.name === "Custom Status"
  );

  if (customStatus && customStatus.emoji) {
    const animated = customStatus.emoji.animated ? "true" : "false";
    return `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.webp?animated=${animated}`;
  }

  return null;
}

function processBio(bio) {
  if (!bio) return null;

  const decodedBio = bio
    .replace(/\\u003C/g, "<")
    .replace(/\\u003Ca/g, "<a")
    .replace(/\\u003E/g, ">");

  const emojiRegex = /<a:(.*?):(\d+?)>|\<(.*?):(\d+?)>/g;

  const processedBio = decodedBio.replace(
    emojiRegex,
    (match, animatedName, animatedId, staticName, staticId) => {
      if (animatedName && animatedId) {
        return `https://cdn.discordapp.com/emojis/${animatedId}.webp?animated=true`;
      } else if (staticName && staticId) {
        return `https://cdn.discordapp.com/emojis/${staticId}.webp?animated=false`;
      }
      return match;
    }
  );

  return processedBio;
}

function getGuildCreationDate(guildId) {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = BigInt(guildId) >> 22n;
  const creationDate = new Date(Number(timestamp) + DISCORD_EPOCH);

  return creationDate
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(", ", ", ");
}

function getCreation(userId) {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = BigInt(userId) >> 22n;
  const creationDate = new Date(Number(timestamp) + DISCORD_EPOCH);

  return creationDate.toISOString();
}

function getEmoji(guild) {
  const verified = guild.verified;
  const community = guild.features.includes("COMMUNITY");
  const discoverable = guild.features.includes("DISCOVERABLE");
  const boostCount = guild.premiumSubscriptionCount;
  const boostLevel = guild.premiumTier;

  if (verified) {
    return "https://cdn3.emoji.gg/emojis/1178-verified.png";
  }
  if (community) {
    if (discoverable) {
      if (boostCount > 0) {
        return "https://cdn3.emoji.gg/emojis/4118-community-server-boosted-public.png";
      } else {
        return "https://cdn3.emoji.gg/emojis/5006-community-server-w.png";
      }
    } else {
      if (boostCount > 0) {
        return "https://cdn3.emoji.gg/emojis/3388-community-server-boosted.png";
      } else {
        return "https://cdn3.emoji.gg/emojis/4118-community-server-w.png";
      }
    }
  } else {
    if (boostLevel === 1) {
      return "https://cdn3.emoji.gg/emojis/73190-1-level-boost.png";
    }
    if (boostLevel === 2) {
      return "https://cdn3.emoji.gg/emojis/18822-2-level-boost.png";
    }
    if (boostLevel === 3) {
      return "https://cdn3.emoji.gg/emojis/62148-3-level-boost.png";
    }
  }
  return null;
}

function getAccountCreationDate(userId) {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = BigInt(userId) >> 22n;
  const creationDate = new Date(Number(timestamp) + DISCORD_EPOCH);

  const formattedDate = creationDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return formattedDate.replace(", ", ", ");
}

const processConnectedAccounts = (accounts) => {
  return accounts.map((account) => {
    let link = null;
    switch (account.type) {
      case "reddit":
        link = `https://reddit.com/user/${account.name}`;
        break;
      case "tiktok":
        link = `https://tiktok.com/@${account.name}`;
        break;
      case "twitter":
        link = `https://twitter.com/${account.name}`;
        break;
      case "ebay":
        link = `https://ebay.com/usr/${account.name}`;
        break;
      case "github":
        link = `https://github.com/${account.name}`;
        break;
      case "instagram":
        link = `https://instagram.com/${account.name}`;
        break;
      case "twitch":
        link = `https://twitch.tv/${account.name}`;
        break;
      case "domain":
        link = `https://${account.id}`;
        break;
      case "roblox":
        link = `https://roblox.com/pt/users/${account.id}`;
        break;
      case "steam":
        link = `https://steamcommunity.com/profiles/${account.id}`;
        break;
      case "spotify":
        link = `https://open.spotify.com/user/${account.id}`;
        break;
      case "youtube":
        link = `https://youtube.com/channel/${account.id}`;
        break;
      default:
        link = null;
    }
    return { type: account.type, name: account.name, link };
  });
};

const formatTime = (ms) => {
  if (ms < 0) return "00:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const processLargeImage = (image, applicationId, activityName) => {
  const defaultGame = defaultImages[activityName];

  if (defaultGame) {
    return defaultGame.largeImage;
  }

  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split("/");
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join("/");
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return config.DEFAULT_ACTIVITY_IMAGE;
};

const processSmallImage = (image, applicationId) => {
  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split("/");
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join("/");
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return null;
};

module.exports = {
  checkUserInGuilds,
  statusEmoji,
  processBio,
  getGuildCreationDate,
  getEmoji,
  getCreation,
  getAccountCreationDate,
  processLargeImage,
  processSmallImage,
  processConnectedAccounts,
  formatTime,
};
