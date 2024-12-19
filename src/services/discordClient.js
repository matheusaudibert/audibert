const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const config = require('../config/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

const initClient = async () => {
  try {
    await client.login(config.DISCORD_TOKEN);
    
    client.once('ready', () => {
      console.log(`Bot inicializado: ${client.user.tag}`);
      client.user.setPresence({
        activities: [
          {
            name: 'api.audibert.rest/user/',
            type: ActivityType.Playing,
          }
        ],
      });
    });

    client.on('error', (error) => {
      console.error('Erro no client:', error);
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

initClient();

module.exports = client;