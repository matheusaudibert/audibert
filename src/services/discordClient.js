const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', async () => {
  client.user.setPresence({
        activities: [
            {
                name: 'api.audibert.rest',
                type: ActivityType.Playing,
                url: 'https://api.audibert.rest'
            }
        ]
    });
});

client.login(config.DISCORD_TOKEN);

module.exports = client;