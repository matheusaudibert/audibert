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
  const guild = client.guilds.cache.get(config.GUILD_ID);
  if (guild) {
    console.log(`Conectado à guilda: ${guild.name}`);
  } else {
    console.error('Guild not found');
  }
});

client.login(config.DISCORD_TOKEN);

module.exports = client;