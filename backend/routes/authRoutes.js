const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAdmin } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", requireAdmin, authController.register);

module.exports = router;
