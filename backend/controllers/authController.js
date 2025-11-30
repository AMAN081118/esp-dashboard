const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err || !user)
        return res.status(401).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      req.session.user = { id: user.id, role: user.role };
      res.json({ success: true, role: user.role });
    },
  );
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
};

exports.register = async (req, res) => {
  const { username, password, name, age, experience } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, password, role, name, age, experience) VALUES (?, ?, 'worker', ?, ?, ?)`,
    [username, hash, name, age, experience],
    function (err) {
      if (err)
        return res.status(500).json({ error: "User exists or DB error" });
      res.json({ success: true, userId: this.lastID });
    },
  );
};
