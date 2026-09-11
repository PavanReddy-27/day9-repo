import express from "express";
import rateLimit from "express-rate-limit";
import { getDBHealth } from "../config/db.js";
import { login, refresh, logout, verifyLoginMfa, generateMfaSetup, enableMfa, disableMfa, getSessions, revokeSession } from "../controllers/authController.js";
import {
  getLocations,
  getDepartments,
  getTeams,
  getEmployees,
  getEmployeeById,
  updateEmployeeShift,
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
import {
  getNotifications,
  generateNotification,
  deleteNotification,
  clearAllNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { authenticateJWT, requireRole, applyRoleDataScope, validateObjectId } from "../middleware/authMiddleware.js";
import { validateDataScope } from "../middleware/dataScopeMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema, refreshSchema } from "../validators/authSchema.js";
import { checkInSchema, checkOutSchema, correctionSchema, breakSchema } from "../validators/attendanceSchema.js";
import { leaveSchema } from "../validators/leaveSchema.js";

import { sseMiddleware } from "../utils/sse.js";

const router = express.Router();

// Server-Sent Events Endpoint (authenticated)
router.get("/events/stream", authenticateJWT, sseMiddleware);


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

// Authentication Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5000, // Relaxed for local dev and testing
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Routes
router.post("/auth/login", loginLimiter, validateRequest(loginSchema), login);
router.post("/auth/login/mfa", verifyLoginMfa);
router.post("/auth/refresh", validateRequest(refreshSchema), refresh);
router.post("/auth/logout", authenticateJWT, logout);
router.get("/auth/mfa/generate", authenticateJWT, generateMfaSetup);
router.post("/auth/mfa/enable", authenticateJWT, enableMfa);
router.post("/auth/mfa/disable", authenticateJWT, disableMfa);

// Session Management Routes
router.get("/auth/sessions", authenticateJWT, getSessions);
router.delete("/auth/sessions/:id", authenticateJWT, revokeSession);

// Protected Organization & Employee Routes
router.get("/locations", authenticateJWT, validateDataScope, getLocations);
router.get("/departments", authenticateJWT, validateDataScope, getDepartments);
router.get("/teams", authenticateJWT, validateDataScope, getTeams);
router.get("/employees", authenticateJWT, validateDataScope, getEmployees);
router.get("/employees/:id", authenticateJWT, validateObjectId("id"), getEmployeeById);
router.patch("/employees/:id/shift", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateObjectId("id"), updateEmployeeShift);

// Protected Analytics Routes
router.get("/analytics/stream", authenticateJWT, streamAnalytics);
router.get("/analytics/workforce", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateDataScope, getWorkforceAnalytics);
router.get("/analytics/hiring", authenticateJWT, requireRole(["Admin", "HR", "Manager"]), validateDataScope, getHiringAnalytics);
router.get("/analytics/attendance", authenticateJWT, validateDataScope, getAttendanceAnalytics);
router.get("/analytics/departments", authenticateJWT, validateDataScope, getDepartmentAnalytics);
router.get("/analytics/skills", authenticateJWT, validateDataScope, getSkillsAnalytics);
router.get("/analytics/performance", authenticateJWT, validateDataScope, getPerformanceAnalytics);
router.get("/analytics/productivity", authenticateJWT, validateDataScope, getProductivityAnalytics);

// Protected Attendance Routes
router.get("/attendance/status", authenticateJWT, getAttendanceStatus);
router.post("/attendance/check-in", authenticateJWT, validateRequest(checkInSchema), checkIn);
router.post("/check-in", authenticateJWT, validateRequest(checkInSchema), checkIn);
router.post("/attendance/break", authenticateJWT, validateRequest(breakSchema), startBreak);
router.post("/break", authenticateJWT, validateRequest(breakSchema), startBreak);
router.post("/attendance/resume", authenticateJWT, validateRequest(breakSchema), resumeWork);
router.post("/resume", authenticateJWT, validateRequest(breakSchema), resumeWork);
router.post("/attendance/check-out", authenticateJWT, validateRequest(checkOutSchema), checkOut);
router.post("/check-out", authenticateJWT, validateRequest(checkOutSchema), checkOut);
router.get("/attendance/history", authenticateJWT, validateDataScope, applyRoleDataScope, getAttendanceHistory);
router.get("/attendance/global", authenticateJWT, validateDataScope, getGlobalAttendance);

// Attendance Corrections Routes
router.post("/attendance/corrections", authenticateJWT, validateRequest(correctionSchema), createCorrection);
router.get("/attendance/corrections", authenticateJWT, validateDataScope, getCorrections);
router.patch("/attendance/corrections/:id/approve", authenticateJWT, requireRole(["Manager"]), validateObjectId("id"), approveCorrection);
router.patch("/attendance/corrections/:id/reject", authenticateJWT, requireRole(["Manager"]), validateObjectId("id"), rejectCorrection);

// Leave Requests Routes
router.get("/leaves", authenticateJWT, validateDataScope, getLeaveRequests);
router.post("/leaves", authenticateJWT, requireRole(["Employee"]), validateRequest(leaveSchema), createLeaveRequest);
router.patch("/leaves/:id/status", authenticateJWT, requireRole(["Manager", "HR", "Admin"]), validateObjectId("id"), updateLeaveStatus);

// Notifications Routes
router.get("/notifications", authenticateJWT, getNotifications);
router.post("/notifications/generate", authenticateJWT, generateNotification);
router.delete("/notifications/clear-all", authenticateJWT, clearAllNotifications);
router.delete("/notifications/:id", authenticateJWT, validateObjectId("id"), deleteNotification);
router.patch("/notifications/read-all", authenticateJWT, markAllAsRead);
router.patch("/notifications/:id/read", authenticateJWT, validateObjectId("id"), markAsRead);

// Audit Logs (Admin / HR only)
router.get("/audit-logs", authenticateJWT, requireRole(["Admin", "HR"]), getAuditLogs);

// Recruitment Routes (HR / Admin)
import { getJobPosts, createJobPost } from "../controllers/recruitmentController.js";
router.get("/recruitment/jobs", authenticateJWT, getJobPosts);
router.post("/recruitment/jobs", authenticateJWT, requireRole(["Admin", "HR"]), createJobPost);

import payrollRoutes from "./payrollRoutes.js";
router.use("/payroll", authenticateJWT, payrollRoutes);

export default router;
