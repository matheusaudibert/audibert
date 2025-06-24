const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const config = require("./config/config");
const client = require("./services/discordClient");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

// Rota padrão
app.get("/", async (req, res) => {
  try {
    const mainGuild = await client.guilds.fetch(config.MAIN_GUILD);
    const memberCount = mainGuild.memberCount;

    res.json({
      data: {
        info: "Grux provides Discord presences as an API. Find out more here: https://github.com/matheusaudibert/grux",
        discord_invite: "https://discord.gg/gu7sKjwEz5",
        monitored_user_count: memberCount,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching guild data:", error);
    res.status(500).json({
      error: {
        code: "internal_server_error",
        message: "An error occurred while processing the request",
      },
      success: false,
    });
  }
});

app.use("/user", userRoutes);
app.use("/activity", activityRoutes);

app.listen(PORT, () => {
  console.log(
    `API running on http://localhost:${PORT}/user/1274150219482660897`
  );
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "not_found",
      message: "Route does not exist",
    },
    success: false,
  });
});

module.exports = app;
