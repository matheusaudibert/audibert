const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");
const mcache = require("memory-cache");
const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

const cache = (duration) => {
  return (req, res, next) => {
    const key = "__express__" + req.originalUrl || req.url;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(JSON.parse(cachedBody));
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

// Cache 5 min (300 secs)
app.use("/user", cache(300), userRoutes);
app.use("/activity", cache(300), activityRoutes);

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
