import express from "express";
import { getSystemHealth, submitJobLog } from "../../controllers/admin/monitoringController.js";
import { authenticateJWT, requireRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health-metrics", authenticateJWT, requireRole(["Admin"]), getSystemHealth);
router.post("/job-log", authenticateJWT, requireRole(["Admin"]), submitJobLog);

export default router;
