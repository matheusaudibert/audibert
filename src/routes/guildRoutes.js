const express = require('express');
const router = express.Router();
const client = require('../services/discordClient');
const { getGuildCreationDate } = require('../utils/jsonProcessor');

router.get('/:id', async (req, res) => {
  const GUILD_ID = req.params.id;

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    
    if (!guild) {
      return res.status(404).json({
        error: {
          code: 'guild_not_found',
          message: 'Guild not found or bot is not a member',
          invite_the_bot: 'https://api.audibert.rest',
        },
        success: false
      });
    }

    const onlineMembers = guild.members.cache.filter(member => 
      member.presence?.status === 'online' || 
      member.presence?.status === 'idle' || 
      member.presence?.status === 'dnd'
    ).size;

    const getIconUrl = (icon) => {
      if (!icon) return null;
      const extension = icon.startsWith('a_') ? '.gif' : '.png';
      return `https://cdn.discordapp.com/icons/${guild.id}/${icon}${extension}`;
    };

    const getBannerUrl = (banner) => {
      if (!banner) return null;
      const extension = banner.startsWith('a_') ? '.gif' : '.png';
      return `https://cdn.discordapp.com/banners/${guild.id}/${banner}${extension}`;
    };

    const guildData = {
      id: guild.id,
      owner_id: guild.ownerId,
      creation_date: guild.createdAt,
      on_since: getGuildCreationDate(guild.id),
      name: guild.name,
      description: guild.description || null,
      icon: getIconUrl(guild.icon),
      banner: getBannerUrl(guild.banner),
      splash: guild.splash ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png` : null,
      boost_count: guild.premiumSubscriptionCount,
      boost_level: guild.premiumTier,
      community: guild.features.includes('COMMUNITY'),
      verified: guild.verified,
      member_count: guild.memberCount,
      member_online_count: onlineMembers,
      country: guild.preferredLocale,
    };

    const filteredGuildData = Object.fromEntries(
      Object.entries(guildData).filter(([_, value]) => value !== null)
    );

    const guildInfo = {
      data: filteredGuildData,
      success: true
    };

    res.json(guildInfo);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: {
        code: 'internal_server_error',
        message: 'An error occurred while processing the request',
      },
      success: false,
    });
  }
});

module.exports = router;