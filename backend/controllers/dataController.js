const db = require("../config/db");

// Helper: classify machine status
function classifyStatus(encoder, vibration) {
  if (encoder === 0 && vibration == 0) return "Off";
  if (encoder === 0 && vibration < 60) return "Idle";
  if (encoder > 0 && vibration > 60) return "Machining Active";
  return "Unknown";
}

exports.addData = (req, res) => {
  const { rpm, vibration, encoder, machine_id } = req.body;
  let worker_id = null;
  let session_id = null;
  if (req.session.user && req.session.user.role === "worker") {
    worker_id = req.session.user.id;
  } else if (req.body.worker_id) {
    worker_id = req.body.worker_id;
  }
  // Find active session for this worker and machine
  if (worker_id && machine_id) {
    db.get(
      `SELECT id FROM sessions WHERE worker_id = ? AND machine_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
      [worker_id, machine_id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        session_id = row ? row.id : null;
        insertReading();
      },
    );
  } else {
    insertReading();
  }
  function insertReading() {
    if (rpm == null || vibration == null || encoder == null) {
      return res.status(400).json({ error: "Missing values" });
    }
    const status = classifyStatus(rpm, encoder, vibration);
    // Only insert reading if worker_id and session_id are both present
    if (worker_id && session_id) {
      db.run(
        `INSERT INTO readings (rpm, vibration, encoder, worker_id, session_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [rpm, vibration, encoder, worker_id, session_id, status],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID, status });
        },
      );
    } else {
      // Optionally, you can skip or log readings that don't match a session
      res
        .status(400)
        .json({ error: "No active session found for worker and machine" });
    }
  }
};

exports.getLive = (req, res) => {
  db.all(
    `SELECT * FROM readings ORDER BY timestamp DESC LIMIT 50`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.reverse());
    },
  );
};

exports.getHistory = (req, res) => {
  const { date, time, year } = req.query;
  let query = `SELECT * FROM readings WHERE 1=1`;
  const params = [];

  // Filter by year (default: current year)
  if (year) {
    query += ` AND strftime('%Y', timestamp) = ?`;
    params.push(year.toString());
  } else {
    // Default: only last 1 year
    query += ` AND timestamp >= date('now', '-1 year')`;
  }

  // Filter by date
  if (date) {
    query += ` AND date(timestamp) = ?`;
    params.push(date);
  }

  // Filter by time (HH:MM)
  if (time) {
    query += ` AND strftime('%H:%M', timestamp) = ?`;
    params.push(time);
  }

  query += ` ORDER BY timestamp DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Get status summary for a session (counts for each status)
exports.getSessionStatusSummary = (req, res) => {
  const sessionId = req.params.sessionId;
  db.all(
    `SELECT status, COUNT(*) as count FROM readings WHERE session_id = ? GROUP BY status`,
    [sessionId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
};

// Get total uptime for a given day (all readings, ignore worker/machine if not provided)
exports.getUptimeForDay = (req, res) => {
  const { date, worker_id, machine_id } = req.query;
  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }
  // Only count readings with status 'Machining Active' (qualifying status)
  let query = `SELECT COUNT(*) as count FROM readings WHERE date(timestamp) = ? AND status = ?`;
  const params = [date, "Machining Active"];
  if (worker_id) {
    query += ` AND worker_id = ?`;
    params.push(worker_id);
  }
  if (machine_id) {
    query += ` AND machine_id = ?`;
    params.push(machine_id);
  }
  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    // Each reading = 1 second of uptime
    res.json({ uptimeSeconds: row.count });
  });
};

// Get total uptime for each day (optionally for a worker and machine)
exports.getUptimeByDay = (req, res) => {
  const { worker_id, machine_id, days } = req.query;
  const daysLimit = days ? parseInt(days) : 7;
  let query = `SELECT date(timestamp) as day, COUNT(*) as uptimeSeconds FROM readings WHERE status = ?`;
  const params = ["Machining Active"];
  if (worker_id) {
    query += ` AND worker_id = ?`;
    params.push(worker_id);
  }
  if (machine_id) {
    query += ` AND machine_id = ?`;
    params.push(machine_id);
  }
  query += ` GROUP BY day ORDER BY day DESC LIMIT ?`;
  params.push(daysLimit);
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Each reading = 1 second of uptime
    res.json(rows);
  });
};
