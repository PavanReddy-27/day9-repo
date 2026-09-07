"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatus = exports.createLeaveRequest = exports.getLeaveRequests = void 0;
var LeaveRequest_js_1 = __importDefault(require("../models/LeaveRequest.js"));
var Notification_js_1 = __importDefault(require("../models/Notification.js"));
var audit_js_1 = require("../utils/audit.js");
var sse_js_1 = require("../utils/sse.js");
var mongoose_1 = __importDefault(require("mongoose"));
// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
// @desc    Get all leave requests
// @route   GET /api/v1/leaves
// @access  Private (Role-based data scope applied via middleware)
var getLeaveRequests = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var role, status_1, query, empId, leaves, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                role = (req.user || { role: req.role }).role;
                status_1 = req.query.status;
                query = { companyId: req.companyId };
                // Apply filters based on role
                if (role === "Employee") {
                    empId = (_a = req.employee) === null || _a === void 0 ? void 0 : _a._id;
                    if (!empId) {
                        res.status(404).json({ error: "Employee profile not found" });
                        return [2 /*return*/];
                    }
                    query.employeeId = empId;
                }
                else if (role === "Manager") {
                    // Remove department constraint so managers can see all leave requests across the company
                    // (same as Admin and HR)
                }
                // HR / Admin: company-wide visibility (all statuses, incl. Pending to review).
                if (status_1 && typeof status_1 === "string" && status_1 !== "All") {
                    query.status = status_1;
                }
                return [4 /*yield*/, LeaveRequest_js_1.default.find(query)
                        .populate("employeeId", "firstName lastName employeeId departmentId")
                        .populate("reviewedBy", "firstName lastName")
                        .sort({ createdAt: -1 })];
            case 1:
                leaves = _b.sent();
                res.json(leaves);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error("Error fetching leave requests:", error_1);
                res.status(500).json({ error: "Server error" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getLeaveRequests = getLeaveRequests;
// @desc    Apply for a leave request
// @route   POST /api/v1/leaves
// @access  Private (Employee)
var createLeaveRequest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, companyId, _a, type, startDate, endDate, reason, fromDate, toDate, empId, durationDays, newLeaveArr, newLeave, populatedLeave, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _c.sent();
                session.startTransaction();
                _c.label = 2;
            case 2:
                _c.trys.push([2, 15, , 18]);
                companyId = req.companyId;
                _a = req.body, type = _a.type, startDate = _a.startDate, endDate = _a.endDate, reason = _a.reason;
                if (!(!type || !startDate || !endDate || !reason)) return [3 /*break*/, 4];
                return [4 /*yield*/, session.abortTransaction()];
            case 3:
                _c.sent();
                session.endSession();
                res.status(400).json({ error: "Missing required fields: type, startDate, endDate, reason" });
                return [2 /*return*/];
            case 4:
                fromDate = new Date(startDate);
                toDate = new Date(endDate);
                if (!(isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))) return [3 /*break*/, 6];
                return [4 /*yield*/, session.abortTransaction()];
            case 5:
                _c.sent();
                session.endSession();
                res.status(400).json({ error: "Invalid date format provided" });
                return [2 /*return*/];
            case 6:
                if (!(fromDate > toDate)) return [3 /*break*/, 8];
                return [4 /*yield*/, session.abortTransaction()];
            case 7:
                _c.sent();
                session.endSession();
                res.status(400).json({ error: "Start date must be before or equal to end date" });
                return [2 /*return*/];
            case 8:
                empId = (_b = req.employee) === null || _b === void 0 ? void 0 : _b._id;
                if (!!empId) return [3 /*break*/, 10];
                return [4 /*yield*/, session.abortTransaction()];
            case 9:
                _c.sent();
                session.endSession();
                res.status(404).json({ error: "Employee profile not found" });
                return [2 /*return*/];
            case 10:
                durationDays = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)) + 1);
                return [4 /*yield*/, LeaveRequest_js_1.default.create([{
                            companyId: companyId,
                            employeeId: empId,
                            type: type,
                            startDate: startDate,
                            endDate: endDate,
                            durationDays: durationDays,
                            reason: reason,
                            status: "Pending",
                        }], { session: session })];
            case 11:
                newLeaveArr = _c.sent();
                newLeave = newLeaveArr[0];
                return [4 /*yield*/, LeaveRequest_js_1.default.findById(newLeave._id).session(session).populate("employeeId", "firstName lastName employeeId")];
            case 12:
                populatedLeave = _c.sent();
                return [4 /*yield*/, (0, audit_js_1.writeAuditLog)(req, "LEAVE_REQUESTED", "Requested ".concat(type, " leave (").concat(startDate, " to ").concat(endDate, ")"), "LeaveRequest", String(newLeave._id), { session: session })];
            case 13:
                _c.sent();
                return [4 /*yield*/, session.commitTransaction()];
            case 14:
                _c.sent();
                session.endSession();
                res.status(201).json(populatedLeave);
                return [3 /*break*/, 18];
            case 15:
                error_2 = _c.sent();
                if (!session.inTransaction()) return [3 /*break*/, 17];
                return [4 /*yield*/, session.abortTransaction()];
            case 16:
                _c.sent();
                _c.label = 17;
            case 17:
                session.endSession();
                console.error("Error creating leave request:", error_2);
                res.status(500).json({ error: "Server error" });
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); };
exports.createLeaveRequest = createLeaveRequest;
// @desc    Approve or Reject a leave request
// @route   PATCH /api/v1/leaves/:id/status
// @access  Private (Manager / HR / Admin)
var updateLeaveStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, id, status_2, role, reviewerId, leave, typeStr, reviewedByName, message, notifType, notifArr, error_3;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _f.sent();
                session.startTransaction();
                _f.label = 2;
            case 2:
                _f.trys.push([2, 14, , 17]);
                id = req.params.id;
                status_2 = req.body.status;
                if (!!["Approved", "Rejected"].includes(status_2)) return [3 /*break*/, 4];
                return [4 /*yield*/, session.abortTransaction()];
            case 3:
                _f.sent();
                session.endSession();
                res.status(400).json({ error: "Invalid status" });
                return [2 /*return*/];
            case 4:
                role = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.role;
                if (!(role !== "Manager")) return [3 /*break*/, 6];
                return [4 /*yield*/, session.abortTransaction()];
            case 5:
                _f.sent();
                session.endSession();
                res.status(403).json({ error: "Only managers may approve or reject leave requests" });
                return [2 /*return*/];
            case 6:
                reviewerId = ((_b = req.employee) === null || _b === void 0 ? void 0 : _b._id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
                return [4 /*yield*/, LeaveRequest_js_1.default.findOneAndUpdate({ _id: id, companyId: req.companyId }, {
                        status: status_2,
                        reviewedBy: reviewerId || null,
                        reviewedAt: new Date()
                    }, { new: true, session: session }).populate("employeeId", "firstName lastName employeeId userId").populate("reviewedBy", "firstName lastName")];
            case 7:
                leave = _f.sent();
                if (!!leave) return [3 /*break*/, 9];
                return [4 /*yield*/, session.abortTransaction()];
            case 8:
                _f.sent();
                session.endSession();
                res.status(404).json({ error: "Leave request not found" });
                return [2 /*return*/];
            case 9: return [4 /*yield*/, (0, audit_js_1.writeAuditLog)(req, "LEAVE_".concat(status_2.toUpperCase()), "".concat(status_2, " leave request ").concat(String(id)), "LeaveRequest", String(id), { session: session })];
            case 10:
                _f.sent();
                if (!((_d = leave.employeeId) === null || _d === void 0 ? void 0 : _d.userId)) return [3 /*break*/, 12];
                typeStr = leave.type || "Leave";
                reviewedByName = ((_e = leave.reviewedBy) === null || _e === void 0 ? void 0 : _e.firstName) || "your manager";
                message = "Your ".concat(typeStr, " request from ").concat(leave.startDate, " to ").concat(leave.endDate, " has been ").concat(status_2.toLowerCase(), " by ").concat(reviewedByName, ".");
                notifType = status_2 === "Approved" ? "SUCCESS" : "WARNING";
                return [4 /*yield*/, Notification_js_1.default.create([{
                            companyId: req.companyId,
                            userId: leave.employeeId.userId,
                            title: "Leave Request ".concat(status_2),
                            message: message,
                            type: notifType,
                            linkUrl: "/employee/leaves"
                        }], { session: session })];
            case 11:
                notifArr = _f.sent();
                (0, sse_js_1.broadcastSSE)("NOTIFICATION_UPDATE", { userId: leave.employeeId.userId.toString(), notificationId: notifArr[0]._id }, req.companyId);
                (0, sse_js_1.broadcastSSE)("LEAVE_UPDATE", { employeeId: leave.employeeId._id.toString(), status: status_2, leaveId: leave._id }, req.companyId);
                _f.label = 12;
            case 12: return [4 /*yield*/, session.commitTransaction()];
            case 13:
                _f.sent();
                session.endSession();
                res.json(leave);
                return [3 /*break*/, 17];
            case 14:
                error_3 = _f.sent();
                if (!session.inTransaction()) return [3 /*break*/, 16];
                return [4 /*yield*/, session.abortTransaction()];
            case 15:
                _f.sent();
                _f.label = 16;
            case 16:
                session.endSession();
                console.error("Error updating leave status:", error_3);
                res.status(500).json({ error: "Server error" });
                return [3 /*break*/, 17];
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.updateLeaveStatus = updateLeaveStatus;
