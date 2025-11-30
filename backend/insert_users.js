const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");

const users = [
  {
    username: "master",
    password: "506masterpassword",
    role: "admin",
    name: "MASTER",
    age: 40,
    experience: "10 years",
  },
];

(async () => {
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, password, role, name, age, experience) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.username, hash, user.role, user.name, user.age, user.experience],
      (err) => {
        if (err) console.error("Insert error:", err.message);
      },
    );
  }
  db.close();
})();
