const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

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
      code: "404_not_found",
      message: "Route does not exist",
    },
  });
});

module.exports = app;
