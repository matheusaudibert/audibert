const config = require("../config/config");
const defaultImages = require("../config/defaultImages");

const checkUserInGuilds = async (client, USER_ID) => {
  let isUserFound = false;
  let member = null;
  const MAIN_GUILD = config.MAIN_GUILD;

  try {
    try {
      const mainGuild = await client.guilds.fetch(MAIN_GUILD);
      member = await mainGuild.members.fetch(USER_ID, { force: true });
      if (member) {
        isUserFound = true;
        console.log("User found in main guild.");
        return { isUserFound, member };
      }
    } catch (error) {}

    for (const guild of client.guilds.cache.values()) {
      if (guild.id === MAIN_GUILD) continue;

      try {
        member = await guild.members.fetch(USER_ID, { force: true });
        for (const guild of client.guilds.cache.values()) {
          try {
            member = await guild.members.fetch(USER_ID);

            if (member) {
              isUserFound = true;
              break;
            }
          } catch (error) {}
        }
      } catch (error) {}
    }
  } catch (error) {}

  return { isUserFound, member };
};

function getDefaultAvatarNumber(userId) {
  return Number(BigInt(userId) >> 22n) % 5;
}

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

function statusText(activities) {
  const customStatus = activities.find(
    (activity) => activity.name === "Custom Status"
  );

  if (customStatus && customStatus.state) {
    return customStatus.state;
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

const FLAGS_BADGES = {
  DISCORD_EMPLOYEE: {
    id: "staff",
    flag: 1n << 0n,
    description: "Discord Staff",
    asset: "5e74e9b61934fc1f67c65515d1f7e60d",
  },
  PARTNERED_SERVER_OWNER: {
    id: "partner",
    flag: 1n << 1n,
    description: "Partnered Server Owner",
    asset: "3f9748e53446a137a052f3454e2de41e",
  },
  HYPESQUAD_EVENTS: {
    id: "hypesquad",
    flag: 1n << 2n,
    description: "HypeSquad Events",
    asset: "bf01d1073931f921909045f3a39fd264",
  },
  BUG_HUNTER_LEVEL_1: {
    id: "bug_hunter_level_1",
    flag: 1n << 3n,
    description: "Discord Bug Hunter",
    asset: "2717692c7dca7289b35297368a940dd0",
  },
  HOUSE_BRAVERY: {
    id: "hypesquad_house_1",
    flag: 1n << 6n,
    description: "HypeSquad Bravery",
    asset: "8a88d63823d8a71cd5e390baa45efa02",
  },
  HOUSE_BRILLIANCE: {
    id: "hypesquad_house_2",
    flag: 1n << 7n,
    description: "HypeSquad Brilliance",
    asset: "011940fd013da3f7fb926e4a1cd2e618",
  },
  HOUSE_BALANCE: {
    id: "hypesquad_house_3",
    flag: 1n << 8n,
    description: "HypeSquad Balance",
    asset: "956af597459b3d455a723796da19b16f",
  },
  EARLY_SUPPORTER: {
    id: "early_supporter",
    flag: 1n << 9n,
    description: "Early Supporter",
    asset: "7060786766c9c840eb3019e725d2b358",
  },
  BUG_HUNTER_LEVEL_2: {
    id: "bug_hunter_level_2",
    flag: 1n << 14n,
    description: "Discord Bug Hunter",
    asset: "848f79194d4be5ff5f81505cbd0ce1e6",
  },
  VERIFIED_BOT_DEVELOPER: {
    id: "verified_developer",
    flag: 1n << 17n,
    description: "Early Verified Bot Developer",
    asset: "6df5892e0f35b051f8b61eace34f4967",
  },
  ACTIVE_DEVELOPER: {
    id: "active_developer",
    flag: 1n << 22n,
    description: "Active Developer",
    asset: "6bdc42827a38498929a4920da12695d9",
  },
};

function processUserFlags(flags) {
  if (!flags) return [];

  const userFlags = BigInt(flags);
  const badges = [];

  for (const badge of Object.values(FLAGS_BADGES)) {
    if (userFlags & badge.flag) {
      badges.push({
        id: badge.id,
        description: badge.description,
        asset: badge.asset,
        icon_image: `https://cdn.discordapp.com/badge-icons/${badge.asset}.png`,
      });
    }
  }

  return badges;
}

module.exports = {
  checkUserInGuilds,
  getDefaultAvatarNumber,
  statusEmoji,
  statusText,
  processBio,
  getGuildCreationDate,
  getEmoji,
  getCreation,
  getAccountCreationDate,
  processLargeImage,
  processSmallImage,
  processConnectedAccounts,
  formatTime,
  processUserFlags,
};
