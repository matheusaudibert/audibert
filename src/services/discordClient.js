const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log('Bot está online!');
});

client.login(config.DISCORD_TOKEN);

module.exports = client;