const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 3000,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DEFAULT_ACTIVITY_IMAGE: "https://i.ibb.co/1GjmGmdr/a.png",
  DEFAULT_SERVER_IMAGE: "https://i.ibb.co/Hfy65cGT/47700d2e75da.png",
};
