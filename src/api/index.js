const app = require('../app');
const client = require('../services/discordClient');

client.once('ready', () => {
  console.log('Bot is online!');
});

module.exports = app;