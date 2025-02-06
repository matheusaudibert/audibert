const express = require("express");
const path = require("path");
const cors = require("cors");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");
const guildRoutes = require("./routes/guildRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");
const guildsRoutes = require("./routes/guildsRoutes");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/user", userRoutes);
app.use("/guild", guildRoutes);
app.use("/guilds", guildsRoutes);
app.use("/activity", activityRoutes);

client.once("ready", () => {
  client.user.setPresence({
    activities: [
      {
        name: "api.audibert.rest",
        type: ActivityType.Playing,
      },
    ],
  });

  console.log("Bot is online and ready!");

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
});

client.on("error", (error) => {
  console.error("Error in client:", error);
});

client.login(config.DISCORD_TOKEN).catch((error) => {
  console.error("Error logging in:", error);
});

module.exports = { app, client };
