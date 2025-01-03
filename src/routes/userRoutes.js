const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const client = require('../services/discordClient');
const config = require('../config/config');
const { processConnectedAccounts, processLargeImage, processSmallImage, formatTime, getAccountCreationDate, getCreation, checkUserInGuilds } = require('../utils/jsonProcessor');

router.get('/:id', async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member } = await checkUserInGuilds(client, USER_ID);

    if (!member) {
      return res.status(404).json({
        error: {
          code: 'user_not_monitored',
          message: 'User is not being monitored by Audibert',
          server: 'https://discord.gg/QaHyQz34Gq'
        },
        success: false
      });
    }

    fetch(`https://canary.discord.com/api/v10/users/${USER_ID}/profile`, {
      method: "GET",
      headers: { "authorization": config.DISCORD_AUTH }
    })
    .then((response) => {
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Resposta não é JSON.");
    }

    
    return response.json();
  })
    .then(data => {

      const avatarExtension = data.user.avatar ? (data.user.avatar.startsWith('a_') ? 'gif' : 'png') : 'png';
      const bannerExtension = data.user.banner ? (data.user.banner.startsWith('a_') ? 'gif' : 'png') : null;
      const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/0.png`;

      avatar_image = data.user.avatar ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.${avatarExtension}` : defaultAvatar;

      const profileInfo = {
        bot: data.user.bot || "false",
        id: data.user.id,
        creation_date: getCreation(data.user.id),
        member_since: getAccountCreationDate(data.user.id),
        username: data.user.username,
        display_name: data.user.global_name,
        bio: data.user.bio,
        link: `https://discord.com/users/${data.user.id}`,
        avatar: data.user.avatar || '0',
        avatar_image: avatar_image,
        avatar_decoration: data.user.avatar_decoration_data
          ? {
              sku_id: data.user.avatar_decoration_data.sku_id,
              icon: data.user.avatar_decoration_data.asset,
              icon_image: `https://cdn.discordapp.com/avatar-decoration-presets/${data.user.avatar_decoration_data.asset}.png`,
            }
          : null,
        banner: data.user.banner,
        banner_image: data.user.banner ? `https://cdn.discordapp.com/banners/${data.user.id}/${data.user.banner}.${bannerExtension}` : null,
        
        clan: data.user.clan
          ? {
              identity_guild_id: data.user.clan.identity_guild_id,
              tag: data.user.clan.tag,
              icon: data.user.clan.badge,
              icon_image: `https://cdn.discordapp.com/clan-badges/${data.user.clan.identity_guild_id}/${data.user.clan.badge}.png`
            }
          : null,
        badges: data.badges
          ? data.badges.map(badge => ({
              id: badge.id,
              description: badge.description,
              icon: badge.icon,
              icon_image: `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`,
              link: badge.link
            }))
          : null,
        connected_accounts: processConnectedAccounts(data.connected_accounts)
      };

      const filteredProfileInfo = Object.fromEntries(
        Object.entries(profileInfo).filter(([_, value]) => value !== null)
      );

      const activities = member.presence?.activities || [];

      const spotifyActivity = activities
        .filter(activity => activity.name === 'Spotify')
        .map(activity => {
          const now = Date.now();
          const start = activity.timestamps?.start || now;
          const end = activity.timestamps?.end || now;
          const progress = now - start;

          const rawSpotify = {
            type: "Listening to Spotify",
            name: activity.name,
            song: activity.details || null,
            artist: activity.state ? activity.state.replace(/;/g, ',') : null,
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
        data: {
          profile: filteredProfileInfo,
          status: member.presence?.status || 'offline',
          spotify: spotifyActivity.length > 0 ? spotifyActivity[0] : null,
          activity: Activity.length > 0 ? Activity.reverse() : null,
        },
        success: true
      };

      res.json(ApiJSON);
    })
    .catch((err) => {
    
    console.error("Erro ao buscar dados:", err.message);
  });
  } catch (error) {
  }
});

module.exports = router;
