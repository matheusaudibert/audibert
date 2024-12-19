const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_AUTH: process.env.DISCORD_AUTH,
  DEFAULT_IMAGE: "https://i.ibb.co/kqQ14Gn/server-logo-4.png"
};