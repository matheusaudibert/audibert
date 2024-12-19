const app = require('../app');
const client = require('../services/discordClient');
const config = require('../config/config');

client.once('ready', () => {
  console.log('Bot is online!');
  app.listen(3000, () => {
    console.log(`API is running on port 3000`);
  });
});

client.login(config.DISCORD_TOKEN);

module.exports = app;