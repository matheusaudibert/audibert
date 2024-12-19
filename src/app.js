const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const config = require('./config/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', async () => {
  console.log('Bot is online!');
  client.user.setPresence({
    activities: [
      {
        name: 'api.audibert.rest/user/',
        type: ActivityType.Playing,
      }
    ],
  });
});

client.login(config.DISCORD_TOKEN);

const app = express();

app.use(cors());
app.use('/user', userRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: '404_not_found',
      message: 'Route does not exist',
    }
  });
});

module.exports = app, client;