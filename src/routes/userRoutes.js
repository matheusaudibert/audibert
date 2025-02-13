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
} = require("../utils/jsonProcessor");

const authTokens = [
  process.env.DISCORD_AUTH_1,
  process.env.DISCORD_AUTH_2,
  process.env.DISCORD_AUTH_3,
];

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

  console.log(randomAuthToken);

  try {
    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}/profile`,
      {
        method: "GET",
        headers: { authorization: randomAuthToken },
      }
    );

    if (response.status === 401 || response.status === 403) {
      console.log(`Token ${authTokens.indexOf(randomAuthToken) + 1} failed`);
      return fetchUserProfile(userId, usedTokens);
    }

    if (response.status === 429) {
      return {
        status: 429,
        json: {
          error: {
            code: "too_many_requests",
            message: "Too many requests. Please try again later.",
          },
          success: false,
        },
      };
    }

    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Resposta não é JSON.");
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
        },
        success: false,
      });
    }

    const { status, json } = await fetchUserProfile(USER_ID);

    if (status === 429) {
      return res.status(429).json(json);
    }

    const data = json;

    const activities = member.presence?.activities || [];

    const avatarExtension = data.user.avatar
      ? data.user.avatar.startsWith("a_")
        ? "gif"
        : "png"
      : "png";
    const bannerExtension = data.user.banner
      ? data.user.banner.startsWith("a_")
        ? "gif"
        : "png"
      : null;
    const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/0.png`;

    avatar_image = data.user.avatar
      ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.${avatarExtension}`
      : defaultAvatar;

    if (data.user_profile.pronouns) {
      pronouns = data.user_profile.pronouns;
    } else {
      pronouns = null;
    }

    const profileInfo = {
      bot: data.user.bot || "false",
      id: data.user.id,
      creation_date: getCreation(data.user.id),
      member_since: getAccountCreationDate(data.user.id),
      username: data.user.username,
      display_name: data.user.global_name,
      status_emoji: statusEmoji(activities),
      status: statusText(activities),
      pronouns: pronouns,
      bio: data.user.bio,
      link: `https://discord.com/users/${data.user.id}`,
      avatar: data.user.avatar || "0",
      avatar_image: avatar_image,
      avatar_decoration: data.user.avatar_decoration_data
        ? {
            sku_id: data.user.avatar_decoration_data.sku_id,
            icon: data.user.avatar_decoration_data.asset,
            icon_image: `https://cdn.discordapp.com/avatar-decoration-presets/${data.user.avatar_decoration_data.asset}.png`,
          }
        : null,
      banner: data.user.banner,
      banner_image: data.user.banner
        ? `https://cdn.discordapp.com/banners/${data.user.id}/${data.user.banner}.${bannerExtension}`
        : null,

      clan: data.user.clan
        ? {
            identity_guild_id: data.user.clan.identity_guild_id,
            tag: data.user.clan.tag,
            icon: data.user.clan.badge,
            icon_image: `https://cdn.discordapp.com/clan-badges/${data.user.clan.identity_guild_id}/${data.user.clan.badge}.png`,
          }
        : null,
      badges: data.badges
        ? data.badges.map((badge) => ({
            id: badge.id,
            description: badge.description,
            icon: badge.icon,
            icon_image: `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`,
            link: badge.link,
          }))
        : null,
      connected_accounts: processConnectedAccounts(data.connected_accounts),
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
