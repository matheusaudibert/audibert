const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
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
            name: 'api.audibrest',
            type: ActivityType.Playing,
        }
    ],
    });
});

client.login(config.DISCORD_TOKEN);

module.exports = client;