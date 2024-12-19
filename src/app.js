const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const client = require('./services/discordClient');

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

client.once('ready', () => {
  app.listen(3000, () => {
    console.log(`API is running on port 3000`);
  });
});

module.exports = app;