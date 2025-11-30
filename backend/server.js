const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const http = require("http");
const WebSocket = require("ws");
const db = require("./config/db");

const app = express();
const PORT = 5000;

// DB setup (runs table creation)
require("./config/db");

// Middlewares
app.use(
  session({
    secret: "esp32_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  }),
);
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/dataRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));

// Serve frontend
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { rpm, vibration, encoder, machine_id, worker_id, timestamp } =
        data;
      // Find active session for this worker and machine
      db.get(
        `SELECT id FROM sessions WHERE worker_id = ? AND machine_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
        [worker_id, machine_id],
        (err, row) => {
          const session_id = row ? row.id : null;
          // Classify status
          let status = "Unknown";
          if (encoder === 0 && vibration == 0) status = "Off";
          else if (encoder === 0 && vibration < 60) status = "Idle";
          else if (encoder > 0 && vibration > 60) status = "Machining Active";
          // Use device timestamp if provided, else server time
          const readingTimestamp = timestamp || new Date().toISOString();
          db.run(
            `INSERT INTO readings (rpm, vibration, encoder, worker_id, session_id, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              rpm,
              vibration,
              encoder,
              worker_id,
              session_id,
              status,
              readingTimestamp,
            ],
            function (err) {
              if (err) console.error("DB insert error:", err.message);
              // Broadcast to all clients
              const payload = JSON.stringify({
                rpm,
                vibration,
                encoder,
                worker_id,
                machine_id,
                status,
                timestamp: readingTimestamp,
              });
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(payload);
                }
              });
            },
          );
        },
      );
    } catch (e) {
      console.error("Invalid WS message", e);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
