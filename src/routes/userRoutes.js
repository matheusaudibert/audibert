const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const client = require('../services/discordClient');
const config = require('../config/config');
const { processConnectedAccounts, processLargeImage, processSmallImage, formatTime } = require('../utils/activityProcessor');

router.get('/user/:id', async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const guild = client.guilds.cache.get(config.GUILD_ID);
    const member = await guild.members.fetch(USER_ID);

    fetch(`https://discord.com/api/v10/users/${USER_ID}/profile`, {
      method: "GET",
      headers: { "authorization": config.DISCORD_AUTH }
    })
      .then(response => response.json())
      .then(data => {
        const profileInfo = {
          id: data.user.id,
          username: data.user.username,
          display_name: data.user.global_name,
          avatar: data.user.avatar,
          avatar_decoration_data: data.user.avatar_decoration_data
            ? {
                sku_id: data.user.avatar_decoration_data.sku_id,
                asset: `https://cdn.discordapp.com/avatar-decoration-presets/${data.user.avatar_decoration_data.asset}.png`,
              }
            : null,
          bio: data.user.bio,
          clan: data.user.clan
            ? {
                identity_guild_id: data.user.clan.identity_guild_id,
                tag: data.user.clan.tag,
                badge: `https://cdn.discordapp.com/clan-badges/${data.user.clan.identity_guild_id}/${data.user.clan.badge}.png`
            } 
            : null,
          badges: data.badges,
          connected_accounts: processConnectedAccounts(data.connected_accounts)
        };

        const statusInfo = {
          discord_status: member.presence?.status || 'offline'
        };

        const activities = member.presence?.activities || [];

        // Spotify JSON
        const spotifyActivity = activities
          .filter(activity => activity.name === 'Spotify')
          .map(activity => {
            const now = Date.now();
            const start = activity.timestamps?.start || now;
            const end = activity.timestamps?.end || now;
            const progress = now - start;

            const rawSpotify = {
              type: "Listening",
              name: activity.name,
              song: activity.details || null,
              artist: activity.state || null,
              album: activity.assets?.largeText || null,
              album_image: activity.assets?.largeImage?.replace('spotify:', 'https://i.scdn.co/image/') || null,
              link: `https://open.spotify.com/track/${activity.syncId}` || null,
              timestamps: {
                progress: formatTime(progress),
                duration: formatTime(end - start),
              }
            };

            return Object.fromEntries(
              Object.entries(rawSpotify).filter(([_, value]) => value !== null)
            );
          });

        const Activity = activities
          .filter(activity => activity.type === 0)
          .map(activity => {
            const rawActivity = {
              type: "Playing",
              name: activity.name,
              state: activity.state || null,
              details: activity.details || null,
              largeText: activity.assets?.largeText || null,
              largeImage: processLargeImage(activity.assets?.largeImage, activity.applicationId, activity.name),
              smallText: activity.assets?.smallText || null,
              smallImage: activity.assets?.smallImage
                ? processSmallImage(activity.assets.smallImage, activity.applicationId)
                : null,
              timestamps: activity.timestamps?.start
                ? {
                  time_lapsed: (() => {
                    const start = new Date(activity.timestamps.start);
                    const now = new Date();
                    const diff = now - start;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              
                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                  })()
                }
              : null,
            };
            return Object.fromEntries(
            Object.entries(rawActivity).filter(([_, value]) => value !== null)
            );
          });

        const ApiJSON = {
          profile: profileInfo,
          status: statusInfo,
          spotify: spotifyActivity.length > 0 ? spotifyActivity[0] : null,
          activity: Activity.length > 0 ? Activity[0] : null,
        };

        res.json(ApiJSON);
      });

  } catch (error) {
    res.status(500).json({
      error: {
        code: 'user_not_monitored',
        message: 'User is not being monitored by audibert',
        server: 'https://discord.gg/6aQZYRUs'
      }
    });
  }
});

module.exports = router;