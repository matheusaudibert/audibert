const express = require('express');
const router = express.Router();
const client = require('../services/discordClient');

router.get('/', async (req, res) => {
  try {
    const guilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      owner_id: guild.ownerId
    }));

    res.json({
      data: guilds,
      success: true
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: error.message
      },
      success: false
    });
  }
});

module.exports = router;