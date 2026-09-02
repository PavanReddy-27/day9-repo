"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var db_js_1 = require("../config/db.js");
var authController_js_1 = require("../controllers/authController.js");
var employeeController_js_1 = require("../controllers/employeeController.js");
var analyticsController_js_1 = require("../controllers/analyticsController.js");
var attendanceController_js_1 = require("../controllers/attendanceController.js");
var leaveController_js_1 = require("../controllers/leaveController.js");
var auditController_js_1 = require("../controllers/auditController.js");
var notificationController_js_1 = require("../controllers/notificationController.js");
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
var validateRequest_js_1 = require("../middleware/validateRequest.js");
var authSchema_js_1 = require("../validators/authSchema.js");
var attendanceSchema_js_1 = require("../validators/attendanceSchema.js");
var sse_js_1 = require("../utils/sse.js");
var router = express_1.default.Router();
// Server-Sent Events Endpoint
router.get("/events/stream", authMiddleware_js_1.authenticateJWT, sse_js_1.sseMiddleware);
// Health Check
router.get("/health", function (req, res) {
    var dbHealth = (0, db_js_1.getDBHealth)();
    var statusCode = dbHealth.status === "healthy" ? 200 : 503;
    return res.status(statusCode).json({
        status: dbHealth.status,
        database: dbHealth,
        serverTimestamp: new Date().toISOString(),
    });
});
// Authentication Routes
router.post("/auth/login", (0, validateRequest_js_1.validateRequest)(authSchema_js_1.loginSchema), authController_js_1.login);
router.post("/auth/login/mfa", authController_js_1.verifyLoginMfa);
router.post("/auth/refresh", (0, validateRequest_js_1.validateRequest)(authSchema_js_1.refreshSchema), authController_js_1.refresh);
router.post("/auth/logout", authMiddleware_js_1.authenticateJWT, authController_js_1.logout);
router.get("/auth/mfa/generate", authMiddleware_js_1.authenticateJWT, authController_js_1.generateMfaSetup);
router.post("/auth/mfa/enable", authMiddleware_js_1.authenticateJWT, authController_js_1.enableMfa);
router.post("/auth/mfa/disable", authMiddleware_js_1.authenticateJWT, authController_js_1.disableMfa);
// Protected Organization & Employee Routes
router.get("/locations", authMiddleware_js_1.authenticateJWT, employeeController_js_1.getLocations);
router.get("/departments", authMiddleware_js_1.authenticateJWT, employeeController_js_1.getDepartments);
router.get("/teams", authMiddleware_js_1.authenticateJWT, employeeController_js_1.getTeams);
router.get("/employees", authMiddleware_js_1.authenticateJWT, employeeController_js_1.getEmployees);
router.get("/employees/:id", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.validateObjectId)("id"), employeeController_js_1.getEmployeeById);
// Protected Analytics Routes
router.get("/analytics/stream", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.streamAnalytics);
router.get("/analytics/workforce", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Admin", "HR", "Manager"]), analyticsController_js_1.getWorkforceAnalytics);
router.get("/analytics/hiring", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Admin", "HR", "Manager"]), analyticsController_js_1.getHiringAnalytics);
router.get("/analytics/attendance", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.getAttendanceAnalytics);
router.get("/analytics/departments", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.getDepartmentAnalytics);
router.get("/analytics/skills", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.getSkillsAnalytics);
router.get("/analytics/performance", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.getPerformanceAnalytics);
router.get("/analytics/productivity", authMiddleware_js_1.authenticateJWT, analyticsController_js_1.getProductivityAnalytics);
// Protected Attendance Routes
router.get("/attendance/status", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.getAttendanceStatus);
router.post("/attendance/check-in", authMiddleware_js_1.authenticateJWT, (0, validateRequest_js_1.validateRequest)(attendanceSchema_js_1.checkInSchema), attendanceController_js_1.checkIn);
router.post("/check-in", authMiddleware_js_1.authenticateJWT, (0, validateRequest_js_1.validateRequest)(attendanceSchema_js_1.checkInSchema), attendanceController_js_1.checkIn);
router.post("/attendance/break", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.startBreak);
router.post("/break", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.startBreak);
router.post("/attendance/resume", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.resumeWork);
router.post("/resume", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.resumeWork);
router.post("/attendance/check-out", authMiddleware_js_1.authenticateJWT, (0, validateRequest_js_1.validateRequest)(attendanceSchema_js_1.checkOutSchema), attendanceController_js_1.checkOut);
router.post("/check-out", authMiddleware_js_1.authenticateJWT, (0, validateRequest_js_1.validateRequest)(attendanceSchema_js_1.checkOutSchema), attendanceController_js_1.checkOut);
router.get("/attendance/history", authMiddleware_js_1.authenticateJWT, authMiddleware_js_1.applyRoleDataScope, attendanceController_js_1.getAttendanceHistory);
router.get("/attendance/global", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.getGlobalAttendance);
// Attendance Corrections Routes
router.post("/attendance/corrections", authMiddleware_js_1.authenticateJWT, (0, validateRequest_js_1.validateRequest)(attendanceSchema_js_1.correctionSchema), attendanceController_js_1.createCorrection);
router.get("/attendance/corrections", authMiddleware_js_1.authenticateJWT, attendanceController_js_1.getCorrections);
router.patch("/attendance/corrections/:id/approve", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Manager"]), (0, authMiddleware_js_1.validateObjectId)("id"), attendanceController_js_1.approveCorrection);
router.patch("/attendance/corrections/:id/reject", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Manager"]), (0, authMiddleware_js_1.validateObjectId)("id"), attendanceController_js_1.rejectCorrection);
// Leave Requests Routes
router.get("/leaves", authMiddleware_js_1.authenticateJWT, leaveController_js_1.getLeaveRequests);
router.post("/leaves", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Employee"]), leaveController_js_1.createLeaveRequest);
router.patch("/leaves/:id/status", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Manager"]), (0, authMiddleware_js_1.validateObjectId)("id"), leaveController_js_1.updateLeaveStatus);
// Notifications Routes
router.get("/notifications", authMiddleware_js_1.authenticateJWT, notificationController_js_1.getNotifications);
router.patch("/notifications/read-all", authMiddleware_js_1.authenticateJWT, notificationController_js_1.markAllAsRead);
router.patch("/notifications/:id/read", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.validateObjectId)("id"), notificationController_js_1.markAsRead);
// Audit Logs (Admin / HR only)
router.get("/audit-logs", authMiddleware_js_1.authenticateJWT, (0, authMiddleware_js_1.requireRole)(["Admin", "HR"]), auditController_js_1.getAuditLogs);
exports.default = router;
