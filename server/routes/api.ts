import express from "express";
import { getDBHealth } from "../config/db.js";
import { login, refresh, logout, verifyLoginMfa, generateMfaSetup, enableMfa, disableMfa } from "../controllers/authController.js";
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
  streamAnalytics
} from "../controllers/analyticsController.js";
import {
  getAttendanceStatus,
  checkIn,
  startBreak,
  resumeWork,
  checkOut,
  getAttendanceHistory,
  getGlobalAttendance,
  createCorrection,
  getCorrections,
  approveCorrection,
  rejectCorrection,
} from "../controllers/attendanceController.js";
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
} from "../controllers/leaveController.js";
import { getAuditLogs } from "../controllers/auditController.js";
import { authenticateJWT, requireRole, applyRoleDataScope, validateObjectId } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema, refreshSchema } from "../validators/authSchema.js";
import { checkInSchema, checkOutSchema, correctionSchema } from "../validators/attendanceSchema.js";

import { sseMiddleware } from "../utils/sse.js";

const router = express.Router();

// Server-Sent Events Endpoint
router.get("/events/stream", sseMiddleware);


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
router.post("/auth/login", validateRequest(loginSchema), login);
router.post("/auth/login/mfa", verifyLoginMfa);
router.post("/auth/refresh", validateRequest(refreshSchema), refresh);
router.post("/auth/logout", authenticateJWT, logout);
router.get("/auth/mfa/generate", authenticateJWT, generateMfaSetup);
router.post("/auth/mfa/enable", authenticateJWT, enableMfa);
router.post("/auth/mfa/disable", authenticateJWT, disableMfa);

// Protected Organization & Employee Routes
router.get("/locations", authenticateJWT, getLocations);
router.get("/departments", authenticateJWT, getDepartments);
router.get("/teams", authenticateJWT, getTeams);
router.get("/employees", authenticateJWT, getEmployees);
router.get("/employees/:id", authenticateJWT, validateObjectId("id"), getEmployeeById);

// Protected Analytics Routes
router.get("/analytics/stream", authenticateJWT, streamAnalytics);
router.get("/analytics/workforce", authenticateJWT, requireRole(["Admin", "HR"]), getWorkforceAnalytics);
router.get("/analytics/hiring", authenticateJWT, requireRole(["Admin", "HR"]), getHiringAnalytics);
router.get("/analytics/attendance", authenticateJWT, getAttendanceAnalytics);
router.get("/analytics/departments", authenticateJWT, getDepartmentAnalytics);
router.get("/analytics/skills", authenticateJWT, getSkillsAnalytics);
router.get("/analytics/performance", authenticateJWT, getPerformanceAnalytics);
router.get("/analytics/productivity", authenticateJWT, getProductivityAnalytics);

// Protected Attendance Routes
router.get("/attendance/status", authenticateJWT, getAttendanceStatus);
router.post("/attendance/check-in", authenticateJWT, validateRequest(checkInSchema), checkIn);
router.post("/check-in", authenticateJWT, validateRequest(checkInSchema), checkIn);
router.post("/attendance/break", authenticateJWT, startBreak);
router.post("/break", authenticateJWT, startBreak);
router.post("/attendance/resume", authenticateJWT, resumeWork);
router.post("/resume", authenticateJWT, resumeWork);
router.post("/attendance/check-out", authenticateJWT, validateRequest(checkOutSchema), checkOut);
router.post("/check-out", authenticateJWT, validateRequest(checkOutSchema), checkOut);
router.get("/attendance/history", authenticateJWT, applyRoleDataScope, getAttendanceHistory);
router.get("/attendance/global", authenticateJWT, getGlobalAttendance);

// Attendance Corrections Routes
router.post("/attendance/corrections", authenticateJWT, validateRequest(correctionSchema), createCorrection);
router.get("/attendance/corrections", authenticateJWT, getCorrections);
router.patch("/attendance/corrections/:id/approve", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateObjectId("id"), approveCorrection);
router.patch("/attendance/corrections/:id/reject", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateObjectId("id"), rejectCorrection);

// Leave Requests Routes
router.get("/leaves", authenticateJWT, getLeaveRequests);
router.post("/leaves", authenticateJWT, requireRole(["Employee"]), createLeaveRequest);
router.patch("/leaves/:id/status", authenticateJWT, requireRole(["Manager", "HR", "Admin"]), validateObjectId("id"), updateLeaveStatus);

// Audit Logs (Admin / HR only)
router.get("/audit-logs", authenticateJWT, requireRole(["Admin", "HR"]), getAuditLogs);

export default router;
