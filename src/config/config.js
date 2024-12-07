const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: 3000,
  GUILD_ID: '1112920281367973900',
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_AUTH: process.env.DISCORD_AUTH,
  DEFAULT_IMAGE: "https://www.pngarts.com/files/3/Logo-PNG-Image-Background.png"
};