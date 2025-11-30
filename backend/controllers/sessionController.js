const db = require("../config/db");

// Create a new session for a worker on a machine
exports.createSession = (req, res) => {
  const { worker_id, machine_id } = req.body;
  if (!worker_id || !machine_id) {
    return res
      .status(400)
      .json({ error: "worker_id and machine_id are required" });
  }
  // Use default CURRENT_TIMESTAMP for start_time, and NULL for end_time
  db.run(
    `INSERT INTO sessions (worker_id, machine_id) VALUES (?, ?)`,
    [worker_id, machine_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ session_id: this.lastID });
    },
  );
};

// Get active session for a worker and machine
exports.getActiveSession = (req, res) => {
  const { worker_id, machine_id } = req.query;
  db.get(
    `SELECT * FROM sessions WHERE worker_id = ? AND machine_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
    [worker_id, machine_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    },
  );
};

// End a session
exports.endSession = (req, res) => {
  const { session_id } = req.body;
  db.run(
    `UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE id = ?`,
    [session_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    },
  );
};

// Get all active sessions (for admin view)
exports.getAllActiveSessions = (req, res) => {
  db.all(
    `SELECT s.*, u.name as worker_name FROM sessions s JOIN users u ON s.worker_id = u.id WHERE s.end_time IS NULL ORDER BY s.start_time DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
};

// Get uptime for a session (in seconds)
exports.getSessionUptime = (req, res) => {
  const sessionId = req.params.sessionId;
  db.all(
    `SELECT timestamp, status FROM readings WHERE session_id = ? ORDER BY timestamp ASC`,
    [sessionId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      let uptimeMs = 0;
      let prev = null;
      rows.forEach((row) => {
        // Count only when status is not 'Off'
        if (row.status !== "Off" && prev && prev.status !== "Off") {
          const diff = new Date(row.timestamp) - new Date(prev.timestamp);
          uptimeMs += diff;
        }
        prev = row;
      });
      res.json({ uptimeSeconds: Math.floor(uptimeMs / 1000) });
    },
  );
};

// Get last 10 sessions (active or ended)
exports.getRecentSessions = (req, res) => {
  db.all(
    `SELECT s.*, u.name as worker_name FROM sessions s JOIN users u ON s.worker_id = u.id ORDER BY s.start_time DESC LIMIT 10`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
};
