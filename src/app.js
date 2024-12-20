const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use('/user', userRoutes);

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