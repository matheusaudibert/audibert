const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 3000,
  DISCORD_AUTH: process.env.DISCORD_AUTH,
  DEFAULT_ACTIVITY_IMAGE: "https://ibb.co/WpG4T1M",
  DEFAULT_SERVER_IMAGE: "https://ibb.co/WpG4T1M",
};
