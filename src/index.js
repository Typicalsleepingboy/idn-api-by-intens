const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routes = require("./routes/routes");
const config = require("./main/config");
const { sendLogToDiscord } = require("./other/discordLogger");
const app = express();
const port = process.env.PORT || 3000;


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  handler: async (req, res) => {
    await sendLogToDiscord(
      `Limit IP: ${req.ip}`,
      "Warning",
      {
        method: req.method,
        url: req.originalUrl,
      }
    );
    res.status(429).json({
      message: "Wahh request lu terlalu banyak kawan tunggu 15 detik yaaa",
    });
  },
});


app.use(limiter);

// Middleware for CORS
app.use(cors());


app.use(async (req, res, next) => {
  const startTime = Date.now();
  next();

  const responseTime = Date.now() - startTime;
  await sendLogToDiscord(`Received request to ${req.method} ${req.originalUrl}`, "Info", {
    method: req.method,
    url: req.originalUrl,
    responseTime,
  });
});


app.use("/api", routes);

app.get("/", (req, res) => {
  res.send({
    message: "Lu mau nyari apa?? mending join discord intens aja",
    author: "https://github.com/typicalsleepingboy",
    discord: "https://discord.gg/48intenscommunity",
  });
});


app.use(async (err, req, res, next) => {
  console.error(err.stack);
  await sendLogToDiscord(`Error encountered: ${err.message}`, "Error", {
    method: req.method,
    url: req.originalUrl,
  });
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  sendLogToDiscord(`Server started on port ${port}`, "Info");
});
