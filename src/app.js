const express = require("express");
const path = require("path");
const cors = require("cors");
const client = require("./services/discordClient");
const userRoutes = require("./routes/userRoutes");
const guildRoutes = require("./routes/guildRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");
const guildsRoutes = require("./routes/guildsRoutes");

const app = express();

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
  console.log(`Bot on: ${client.user.tag}`);

  app.listen(3000, () => {
    console.log(`API is running on port 3000`);
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "404_not_found",
      message: "Route does not exist",
    },
  });
});

module.exports = app;
