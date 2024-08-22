const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const config = require("./main/config");
const { sendLogToDiscord } = require("./other/discordLogger");
const app = express();
const port = process.env.PORT || 3000;

// Middleware for CORS
app.use(cors());

// Middleware to log all incoming requests
app.use(async (req, res, next) => {
  const startTime = Date.now();
  
  // Call next middleware or route handler
  next();

  // After response is sent
  const responseTime = Date.now() - startTime;
  await sendLogToDiscord(`Received request to ${req.method} ${req.originalUrl}`, "Info", {
    method: req.method,
    url: req.originalUrl,
    responseTime,
  });
});

// Routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.send({
    message: "Lu mau nyari apa?? mending join discord intens aja",
    author: "https://github.com/typicalsleepingboy",
    discord: "https://discord.gg/48intenscommunity",
  });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  await sendLogToDiscord(`Error encountered: ${err.message}`, "Error", {
    method: req.method,
    url: req.originalUrl,
  });
  res.status(500).send("Something went wrong!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  sendLogToDiscord(`Server started on port ${port}`, "Info");
});
