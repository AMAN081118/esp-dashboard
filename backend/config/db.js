const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data.db", (err) => {
  if (err) console.error("DB Error:", err.message);
  else console.log("Connected to SQLite database");
});

// Table creation
// Add worker_id to readings if not exists
// (SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, so check manually)
db.all("PRAGMA table_info(readings);", [], (err, columns) => {
  if (columns && !columns.some((col) => col.name === "worker_id")) {
    db.run("ALTER TABLE readings ADD COLUMN worker_id INTEGER;");
  }
  if (columns && !columns.some((col) => col.name === "status")) {
    db.run("ALTER TABLE readings ADD COLUMN status TEXT;");
  }
  if (columns && !columns.some((col) => col.name === "session_id")) {
    db.run("ALTER TABLE readings ADD COLUMN session_id INTEGER;");
  }
});

db.run(`CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rpm INTEGER,
  vibration REAL,
  encoder INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  worker_id INTEGER,
  session_id INTEGER,
  status TEXT
);`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT CHECK(role IN ('admin', 'worker')) NOT NULL,
  name TEXT,
  age INTEGER,
  experience TEXT
);`);

// Create sessions table for worker-machine sessions
db.run(`CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER,
  machine_id TEXT,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME
);`);

module.exports = db;
