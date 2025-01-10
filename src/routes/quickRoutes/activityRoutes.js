const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const client = require('../../services/discordClient');
const { processLargeImage, processSmallImage, formatTime, checkUserInGuilds } = require('../../utils/jsonProcessor');

router.get('/:id', async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member } = await checkUserInGuilds(client, USER_ID);

    if (!member) {
      return res.status(404).json({
        error: {
          code: 'user_not_monitored',
          message: 'User is not being monitored by Audibert',
          server: 'https://discord.gg/QaHyQz34Gq',
        },
        success: false,
      });
    }

    const userStatus  = member.presence?.status;
    if (userStatus === 'offline'){
      userStatus = 'invisible';
    }

    const activities = member.presence?.activities || [];

    const spotifyActivity = activities
      .filter(activity => activity.name === 'Spotify')
      .map(activity => {
        const now = Date.now();
        const start = activity.timestamps?.start || now;
        const end = activity.timestamps?.end || now;

        const progress = Math.max(0, now - start);
        const duration = Math.max(0, end - start);

        const adjustedDuration = Math.floor(duration / 1000);
        const hours = Math.floor(adjustedDuration / 3600);
        const minutes = Math.floor((adjustedDuration % 3600) / 60);
        const seconds = adjustedDuration % 60;

        const formattedDuration = hours > 0
          ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          : `${minutes}:${String(seconds).padStart(2, '0')}`;

        const rawSpotify = {
          type: "Listening to Spotify",
          name: activity.name,
          song: activity.details || null,
          artist: activity.state ? activity.state.replace(/;/g, ',') : null,
          album: activity.assets?.largeText || null,
          album_image: activity.assets?.largeImage?.replace('spotify:', 'https://i.scdn.co/image/') || null,
          link: `https://open.spotify.com/track/${activity.syncId}` || null,
          timestamps: {
            progress: formatTime(Math.min(progress, duration)),
            duration: formattedDuration,
          },
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

                  return `${hours > 0 ? String(hours).padStart(1, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                })(),
              }
            : null,
        };

        return Object.fromEntries(
          Object.entries(rawActivity).filter(([_, value]) => value !== null)
        );
      });

    const ApiJSON = {
      data: {
        status: userStatus,
        spotify: spotifyActivity.length > 0 ? spotifyActivity[0] : null,
        activity: Activity.length > 0 ? Activity.reverse() : null,
      },
      success: true,
    };

    res.json(ApiJSON);
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
