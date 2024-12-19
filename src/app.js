const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(config.DISCORD_TOKEN);

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

app.listen(3000, () => {
  console.log(`API is running on port 300`);
});