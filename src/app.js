const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');

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

app.listen(config.PORT, () => {
  console.log(`API running on port ${config.PORT}`);
});