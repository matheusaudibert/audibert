const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const client = require("../services/discordClient");
const {
  processConnectedAccounts,
  processLargeImage,
  processSmallImage,
  statusEmoji,
  statusText,
  formatTime,
  getAccountCreationDate,
  getCreation,
  checkUserInGuilds,
  processUserFlags,
} = require("../utils/jsonProcessor");

const authTokens = [process.env.DISCORD_AUTH_1];

async function fetchUserProfile(userId, usedTokens = []) {
  const availableTokens = authTokens.filter(
    (token) => !usedTokens.includes(token)
  );
  if (availableTokens.length === 0) {
    throw new Error("All tokens failed");
  }

  const randomAuthToken =
    availableTokens[Math.floor(Math.random() * availableTokens.length)];
  usedTokens.push(randomAuthToken);

  try {
    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}/profile`,
      {
        method: "GET",
        headers: { authorization: randomAuthToken },
      }
    );

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Error");
    }

    const data = await response.json();
    return { status: 200, json: data };
  } catch (error) {
    throw error;
  }
}

router.get("/:id", async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member } = await checkUserInGuilds(client, USER_ID);

    if (!member) {
      return res.status(404).json({
        error: {
          code: "user_not_monitored",
          message: "User is not being monitored by Audibert",
          server: "https://discord.gg/QaHyQz34Gq",
          invite_the_bot: "https://api.audibert.rest",
        },
        success: false,
      });
    }

    const defaultBadges = processUserFlags(member.user.flags);
    let extraBadges = [];
    let connectedAccounts = [];

    try {
      const { status, json: data } = await fetchUserProfile(USER_ID);

      if (status === 200) {
        const defaultBadgeIds = defaultBadges.map((badge) => badge.id);
        extraBadges = data.badges
          ? data.badges
              .filter((badge) => !defaultBadgeIds.includes(badge.id))
              .map((badge) => ({
                id: badge.id,
                description: badge.description,
                asset: badge.icon,
                icon_image: `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`,
              }))
          : [];

        connectedAccounts = processConnectedAccounts(data.connected_accounts);
      }
    } catch (error) {}

    const activities = member.presence?.activities || [];

    const profileInfo = {
      bot: member.user.bot || "false",
      device: member.presence?.clientStatus?.desktop
        ? "desktop"
        : member.presence?.clientStatus?.mobile
        ? "mobile"
        : member.presence?.clientStatus?.web
        ? "web"
        : null,
      public_flags: member.user.flags,
      id: member.user.id,
      creation_date: getCreation(member.user.id),
      member_since: getAccountCreationDate(member.user.id),
      username: member.user.username,
      display_name: member.user.globalName,
      status_emoji: statusEmoji(activities),
      status: statusText(activities),
      link: `https://discord.com/users/${member.user.id}`,
      avatar: member.user.avatar,
      avatar_image: member.user.displayAvatarURL(),
      avatar_decoration: member.user.avatarDecorationData
        ? {
            sku_id: member.user.avatarDecorationData.skuId,
            icon: member.user.avatarDecorationData.asset,
            icon_image: `https://cdn.discordapp.com/avatar-decoration-presets/${member.user.avatarDecorationData.asset}.png`,
          }
        : null,
      badges: [...defaultBadges, ...extraBadges],
      connected_accounts: connectedAccounts,
    };

    const filteredProfileInfo = Object.fromEntries(
      Object.entries(profileInfo).filter(([_, value]) => value !== null)
    );

    let userStatus = member.presence?.status || "invisible";
    if (userStatus === "offline") {
      userStatus = "invisible";
    }

    const spotifyActivity = activities
      .filter((activity) => activity.name === "Spotify")
      .map((activity) => {
        const now = Date.now();
        const start = activity.timestamps?.start || now;
        const end = activity.timestamps?.end || now;

        const progress = Math.max(0, now - start);
        const duration = Math.max(0, end - start);

        const adjustedDuration = Math.floor(duration / 1000);
        const hours = Math.floor(adjustedDuration / 3600);
        const minutes = Math.floor((adjustedDuration % 3600) / 60);
        const seconds = adjustedDuration % 60;

        const formattedDuration =
          hours > 0
            ? `${hours}:${String(minutes).padStart(2, "0")}:${String(
                seconds
              ).padStart(2, "0")}`
            : `${minutes}:${String(seconds).padStart(2, "0")}`;

        const rawSpotify = {
          type: "Listening to Spotify",
          name: activity.name,
          song: activity.details || null,
          artist: activity.state ? activity.state.replace(/;/g, ",") : null,
          album: activity.assets?.largeText || null,
          album_image:
            activity.assets?.largeImage?.replace(
              "spotify:",
              "https://i.scdn.co/image/"
            ) || null,
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
      .filter((activity) => activity.type === 0)
      .map((activity) => {
        const rawActivity = {
          type: "Playing",
          name: activity.name,
          state: activity.state || null,
          details: activity.details || null,
          largeText: activity.assets?.largeText || null,
          largeImage: processLargeImage(
            activity.assets?.largeImage,
            activity.applicationId,
            activity.name
          ),
          smallText: activity.assets?.smallText || null,
          smallImage: activity.assets?.smallImage
            ? processSmallImage(
                activity.assets.smallImage,
                activity.applicationId
              )
            : null,
          timestamps: activity.timestamps?.start
            ? {
                time_lapsed: (() => {
                  const start = new Date(activity.timestamps.start);
                  const now = new Date();
                  const diff = now - start;

                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                  return `${
                    hours > 0 ? String(hours).padStart(1, "0") + ":" : ""
                  }${String(minutes).padStart(2, "0")}:${String(
                    seconds
                  ).padStart(2, "0")}`;
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
        profile: filteredProfileInfo,
        status: userStatus || "invisible",
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
        code: "internal_server_error",
        message: "An error occurred while processing the request",
      },
      success: false,
    });
  }
});

module.exports = router;
