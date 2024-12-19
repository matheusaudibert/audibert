const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const config = require('./config/config');

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

app.listen(3000, () => {
  console.log(`Server is running on port 2000`);
});


module.exports = app;