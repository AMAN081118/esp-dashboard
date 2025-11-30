const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/me", requireAuth, userController.getMe);
router.put("/me", requireAuth, userController.updateMe);
router.post("/me/change-password", requireAuth, userController.changePassword);
router.delete("/me", requireAuth, userController.deleteMe);
router.get("/users", requireAdmin, userController.getAllUsers);
// Admin: Edit/Delete worker
router.put("/users/:id", requireAdmin, userController.updateWorker);
router.delete("/users/:id", requireAdmin, userController.deleteWorker);
// Sessions
router.get("/sessions", requireAuth, userController.getSessions);
// Worker session management
router.post("/sessions/start", requireAuth, userController.startSession);
router.post("/sessions/end", requireAuth, userController.endSession);
router.get("/sessions/active", requireAuth, userController.getActiveSessions);

module.exports = router;
