const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: 3000,
  GUILD_ID: process.env.GUILD_ID,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_AUTH: process.env.DISCORD_AUTH,
  DEFAULT_IMAGE: "https://cdn3.emoji.gg/emojis/18148-developer-badge.png"
};