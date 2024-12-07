const config = require('../config/config');
const defaultImages = require('../config/defaultImages');

const processConnectedAccounts = (accounts) => {
  return accounts.map(account => {
    let link = null;
    switch (account.type) {
      case 'reddit': link = `https://reddit.com/user/${account.name}`; break;
      case 'tikTok': link = `https://tiktok.com/@${account.name}`; break;
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

module.exports = {
  processLargeImage,
  processSmallImage,
  processConnectedAccounts,
  formatTime
};