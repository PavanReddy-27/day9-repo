import express from "express";
import { getDBHealth } from "../config/db.js";
import { login, refresh, logout } from "../controllers/authController.js";
import {
  getLocations,
  getDepartments,
  getTeams,
  getEmployees,
  getEmployeeById,
} from "../controllers/employeeController.js";
import {
  getWorkforceAnalytics,
  getHiringAnalytics,
  getAttendanceAnalytics,
  getDepartmentAnalytics,
  getSkillsAnalytics,
  getPerformanceAnalytics,
  getProductivityAnalytics,
} from "../controllers/analyticsController.js";
import {
  getAttendanceStatus,
  checkIn,
  startBreak,
  resumeWork,
  checkOut,
  getAttendanceHistory,
  createCorrection,
  getCorrections,
  approveCorrection,
  rejectCorrection,
} from "../controllers/attendanceController.js";
import { authenticateJWT, requireRole, applyRoleDataScope, validateObjectId } from "../middleware/authMiddleware.js";

const router = express.Router();

// Health Check
router.get("/health", (req, res) => {
  const dbHealth = getDBHealth();
  const statusCode = dbHealth.status === "healthy" ? 200 : 503;
  return res.status(statusCode).json({
    status: dbHealth.status,
    database: dbHealth,
    serverTimestamp: new Date().toISOString(),
  });
});

// Authentication Routes
router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", authenticateJWT, logout);

// Protected Organization & Employee Routes
router.get("/locations", authenticateJWT, getLocations);
router.get("/departments", authenticateJWT, getDepartments);
router.get("/teams", authenticateJWT, getTeams);
router.get("/employees", authenticateJWT, applyRoleDataScope, getEmployees);
router.get("/employees/:id", authenticateJWT, validateObjectId("id"), getEmployeeById);

// Protected Analytics Routes
router.get("/analytics/workforce", authenticateJWT, requireRole(["Admin", "HR"]), getWorkforceAnalytics);
router.get("/analytics/hiring", authenticateJWT, requireRole(["Admin", "HR"]), getHiringAnalytics);
router.get("/analytics/attendance", authenticateJWT, getAttendanceAnalytics);
router.get("/analytics/departments", authenticateJWT, getDepartmentAnalytics);
router.get("/analytics/skills", authenticateJWT, getSkillsAnalytics);
router.get("/analytics/performance", authenticateJWT, getPerformanceAnalytics);
router.get("/analytics/productivity", authenticateJWT, getProductivityAnalytics);

// Protected Attendance Routes
router.get("/attendance/status", authenticateJWT, getAttendanceStatus);
router.post("/attendance/check-in", authenticateJWT, checkIn);
router.post("/check-in", authenticateJWT, checkIn);
router.post("/attendance/break", authenticateJWT, startBreak);
router.post("/break", authenticateJWT, startBreak);
router.post("/attendance/resume", authenticateJWT, resumeWork);
router.post("/resume", authenticateJWT, resumeWork);
router.post("/attendance/check-out", authenticateJWT, checkOut);
router.post("/check-out", authenticateJWT, checkOut);
router.get("/attendance/history", authenticateJWT, applyRoleDataScope, getAttendanceHistory);

// Attendance Corrections Routes
router.post("/attendance/corrections", authenticateJWT, createCorrection);
router.get("/attendance/corrections", authenticateJWT, getCorrections);
router.patch("/attendance/corrections/:id/approve", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateObjectId("id"), approveCorrection);
router.patch("/attendance/corrections/:id/reject", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateObjectId("id"), rejectCorrection);

export default router;
