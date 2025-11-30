const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.getMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  db.get(
    `SELECT id, username, role, name, age, experience FROM users WHERE id = ?`,
    [req.session.user.id],
    (err, user) => {
      if (err || !user)
        return res.status(404).json({ error: "User not found" });
      res.json(user);
    },
  );
};
exports.updateMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  const { name, age, experience } = req.body;
  db.run(
    `UPDATE users SET name = ?, age = ?, experience = ? WHERE id = ?`,
    [name, age, experience, req.session.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "User updated successfully" });
    },
  );
};
exports.changePassword = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  const { oldPassword, newPassword } = req.body;
  db.get(
    `SELECT password FROM users WHERE id = ?`,
    [req.session.user.id],
    (err, user) => {
      if (err || !user)
        return res.status(404).json({ error: "User not found" });
      if (user.password !== oldPassword)
        return res.status(400).json({ error: "Incorrect old password" });

      db.run(
        `UPDATE users SET password = ? WHERE id = ?`,
        [newPassword, req.session.user.id],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ message: "Password changed successfully" });
        },
      );
    },
  );
};
exports.deleteMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  db.run(
    `DELETE FROM users WHERE id = ?`,
    [req.session.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      req.session.destroy();
      res.json({ message: "User deleted successfully" });
    },
  );
};
exports.getAllUsers = (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.all(
    `SELECT id, username, role, name, age, experience FROM users`,
    [],
    (err, users) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(users);
    },
  );
};

// Admin: Update a worker
exports.updateWorker = (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { id } = req.params;
  const { name, age, experience } = req.body;
  db.run(
    `UPDATE users SET name = ?, age = ?, experience = ? WHERE id = ? AND role = 'worker'`,
    [name, age, experience, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Worker updated successfully" });
    },
  );
};

// Admin: Delete a worker
exports.deleteWorker = (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { id } = req.params;
  db.run(
    `DELETE FROM users WHERE id = ? AND role = 'worker'`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Worker deleted successfully" });
    },
  );
};

// Get sessions for a worker (admin or self)
exports.getSessions = (req, res) => {
  const workerId =
    req.session.user.role === "admin"
      ? req.query.worker_id
      : req.session.user.id;
  if (!workerId) return res.status(400).json({ error: "worker_id required" });
  db.all(
    `SELECT * FROM sessions WHERE worker_id = ? ORDER BY start_time DESC`,
    [workerId],
    (err, sessions) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(sessions);
    },
  );
};

// Worker: Start a session
exports.startSession = (req, res) => {
  if (!req.session.user || req.session.user.role !== "worker") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { machine_id } = req.body;
  if (!machine_id)
    return res.status(400).json({ error: "machine_id required" });
  // End any previous session that is still open for this worker
  db.run(
    `UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE worker_id = ? AND end_time IS NULL`,
    [req.session.user.id],
    () => {
      db.run(
        `INSERT INTO sessions (worker_id, machine_id, start_time) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [req.session.user.id, machine_id],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ message: "Session started", session_id: this.lastID });
        },
      );
    },
  );
};

// Worker: End current session
exports.endSession = (req, res) => {
  if (!req.session.user || req.session.user.role !== "worker") {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.run(
    `UPDATE sessions SET end_time = CURRENT_TIMESTAMP WHERE worker_id = ? AND end_time IS NULL`,
    [req.session.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Session ended" });
    },
  );
};

// Get all active sessions (admin or self)
exports.getActiveSessions = (req, res) => {
  let query = `SELECT s.*, u.name as worker_name FROM sessions s JOIN users u ON s.worker_id = u.id WHERE s.end_time IS NULL`;
  let params = [];
  if (req.session.user.role === "worker") {
    query += " AND s.worker_id = ?";
    params.push(req.session.user.id);
  }
  db.all(query, params, (err, sessions) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(sessions);
  });
};
