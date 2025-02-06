const express = require("express");
const path = require("path");
const cors = require("cors");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");
const guildRoutes = require("./routes/guildRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");
const guildsRoutes = require("./routes/guildsRoutes");

const app = express();
const PORT = config.PORT;

setTimeout(() => {
  app.use(cors());
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.use("/user", userRoutes);
  app.use("/guild", guildRoutes);
  app.use("/guilds", guildsRoutes);
  app.use("/activity", activityRoutes);

  app.listen(PORT, () => {
    console.log(`API running in port ${PORT}`);
  });

  app.use("*", (req, res) => {
    res.status(404).json({
      error: {
        code: "404_not_found",
        message: "Route does not exist",
      },
    });
  });
}, 10000);

module.exports = app;
