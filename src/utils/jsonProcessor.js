const config = require('../config/config');
const defaultImages = require('../config/defaultImages');

function getAccountCreationDate(userId) {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = BigInt(userId) >> 22n;
  const creationDate = new Date(Number(timestamp) + DISCORD_EPOCH);

  const formattedDate = creationDate.toLocaleDateString('en-US', {
    month: 'short', 
    day: '2-digit', 
    year: 'numeric', 
  });

  return formattedDate.replace(', ', ', '); 
}

const processConnectedAccounts = (accounts) => {
  return accounts.map(account => {
    let link = null;
    switch (account.type) {
      case 'reddit': link = `https://reddit.com/user/${account.name}`; break;
      case 'tiktok': link = `https://tiktok.com/@${account.name}`; break;
      case 'twitter': link = `https://twitter.com/${account.name}`; break;
      case 'ebay': link = `https://ebay.com/usr/${account.name}`; break;
      case 'github': link = `https://github.com/${account.name}`; break;
      case 'instagram': link = `https://instagram.com/${account.name}`; break;
      case 'twitch': link = `https://twitch.tv/${account.name}`; break;
      case 'domain': link = `https://${account.id}`; break;
      case 'roblox': link = `https://roblox.com/pt/users/${account.id}`; break;
      case 'steam': link = `https://steamcommunity.com/profiles/${account.id}`; break;
      case 'spotify': link = `https://open.spotify.com/user/${account.id}`; break;
      case 'youtube': link = `https://youtube.com/channel/${account.id}`; break;
      default: link = null;
    }
    return { type: account.type, name: account.name, link };
  });
};

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

const processLargeImage = (image, applicationId, activityName) => {
  const defaultGame = defaultImages[activityName];
  
  if (defaultGame) {
    return defaultGame.largeImage;
  }

  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split('/');
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join('/');
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return config.DEFAULT_IMAGE;
};

const processSmallImage = (image, applicationId) => {
  if (image && image.startsWith("mp:external/")) {
    const urlParts = image.split('/');
    if (urlParts.length >= 4) {
      const externalUrl = urlParts.slice(3).join('/');
      return `https://${externalUrl}`;
    }
    return null;
  } else if (image) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return null
};

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
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  return { isUserFound, member };
};

module.exports = {
  getAccountCreationDate,
  processLargeImage,
  processSmallImage,
  processConnectedAccounts,
  formatTime,
  checkUserInGuilds
};
