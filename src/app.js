const express = require('express');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use('/api.audibert', userRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: '404_not_found',
      message: 'Route does not exist',
    }
  });
});

app.listen(config.PORT, () => {
  console.log(`API running on port ${config.PORT}`);
});