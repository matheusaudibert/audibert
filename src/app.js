const express = require('express');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const guildRoutes = require('./routes/guildRoutes');
const activityRoutes = require('./routes/quickRoutes/activityRoutes');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/user', userRoutes);
app.use('/guild', guildRoutes);
app.use('/activity', activityRoutes);

app.listen(3000, () => {
  console.log(`API is running on port 3000`);
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: '404_not_found',
      message: 'Route does not exist',
    }
  });
});

module.exports = app;