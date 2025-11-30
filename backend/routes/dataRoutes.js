const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.post("/data", dataController.addData);
router.get("/live", dataController.getLive);
router.get("/history", dataController.getHistory);
router.get("/session/:sessionId/status-summary", dataController.getSessionStatusSummary);
router.get("/uptime/day", dataController.getUptimeForDay);
router.get("/uptime/by-day", dataController.getUptimeByDay);

module.exports = router;
