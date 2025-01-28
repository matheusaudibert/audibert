const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 3000,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DEFAULT_ACTIVITY_IMAGE: "https://ibb.co/yF7QFQY6",
  DEFAULT_SERVER_IMAGE: "https://ibb.co/WpG4T1M",
};
