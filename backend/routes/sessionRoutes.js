const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.post("/", sessionController.createSession);
router.get("/active", sessionController.getActiveSession);
router.post("/end", sessionController.endSession);
router.get("/all-active", sessionController.getAllActiveSessions);
router.get("/:sessionId/uptime", sessionController.getSessionUptime);
router.get("/recent", sessionController.getRecentSessions);

module.exports = router;
