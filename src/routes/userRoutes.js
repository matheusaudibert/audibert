const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const client = require("../services/discordClient");
const mcache = require("memory-cache");
const {
  checkUserInGuilds,
  processProfileInfo,
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const mongoUri = process.env.MONGODB_URI;

const getCachedFields = (userId) => {
  const cacheKey = `user_cached_fields_${userId}`;
  return mcache.get(cacheKey);
};

const setCachedFields = (userId, fields) => {
  const cacheKey = `user_cached_fields_${userId}`;
  mcache.put(cacheKey, fields, 300 * 1000); // 5 minutos
};

router.get("/:id", async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member, isUserFound } = await checkUserInGuilds(client, USER_ID);

    if (!isUserFound || !member) {
      return handleError(
        res,
        404,
        "user_not_monitored",
        "User is not being monitored by Grux",
        { discord_invite: "https://discord.gg/gu7sKjwEz5" }
      );
    }

    // Verifica cache para campos específicos
    let cachedFields = getCachedFields(USER_ID);

    if (!cachedFields) {
      let userData = null;
      try {
        const mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        const database = mongoClient.db("test");
        const usersCollection = database.collection("users");
        userData = await usersCollection.findOne({ _id: USER_ID });
        await mongoClient.close();
      } catch (dbError) {
        console.error("Error fetching data from MongoDB:", dbError);
        return handleError(
          res,
          500,
          "database_error",
          "Could not retrieve user data from database."
        );
      }

      if (!userData) {
        return handleError(
          res,
          404,
          "user_not_in_database",
          "User is being monitored but it is not in the database."
        );
      }

      // Extrai e cacheia apenas os campos específicos
      cachedFields = {
        badges: userData.badges || [],
        nameplate: userData.nameplate || null,
        connected_accounts: userData.connectedAccounts || [],
        clan: userData.clan || null,
      };

      setCachedFields(USER_ID, cachedFields);
    }

    // Cria userData simulado com campos cacheados
    const userData = {
      badges: cachedFields.badges,
      nameplate: cachedFields.nameplate,
      connectedAccounts: cachedFields.connected_accounts,
      clan: cachedFields.clan,
    };

    const profileInfo = processProfileInfo(member, userData);
    const activities = member.presence?.activities || [];
    const spotifyActivity = processSpotifyActivity(activities);
    const generalActivity = processGeneralActivities(activities);

    let userStatus = member.presence?.status || "invisible";
    if (userStatus === "offline") {
      userStatus = "invisible";
    }

    const apiData = {
      profile: profileInfo,
      status: userStatus,
      spotify: spotifyActivity,
      activity: generalActivity,
    };

    handleSuccess(res, apiData);
  } catch (error) {
    console.error("Unhandled error in user route:", error.message);
    handleError(
      res,
      500,
      "internal_server_error",
      "An error occurred while processing the request"
    );
  }
});

module.exports = router;
