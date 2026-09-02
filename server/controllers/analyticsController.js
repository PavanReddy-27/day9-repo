"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.streamAnalytics = exports.getProductivityAnalytics = exports.getPerformanceAnalytics = exports.getSkillsAnalytics = exports.getDepartmentAnalytics = exports.getAttendanceAnalytics = exports.getHiringAnalytics = exports.getWorkforceAnalytics = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var eventBus_js_1 = require("../services/eventBus.js");
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
var AttendanceRecord_js_1 = __importDefault(require("../models/AttendanceRecord.js"));
var PerformanceRecord_js_1 = __importDefault(require("../models/PerformanceRecord.js"));
var ProductivityRecord_js_1 = __importDefault(require("../models/ProductivityRecord.js"));
var EmployeeSkill_js_1 = __importDefault(require("../models/EmployeeSkill.js"));
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
var getWorkforceAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, filter, _a, totalEmployees, activeEmployees, onLeaveEmployees, riskDistribution, workModeDistribution, statusDistribution, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                filter = __assign(__assign({}, scopeFilter), { role: "Employee" });
                return [4 /*yield*/, Promise.all([
                        Employee_js_1.default.countDocuments(filter),
                        Employee_js_1.default.countDocuments(__assign(__assign({}, filter), { employmentStatus: "Active" })),
                        Employee_js_1.default.countDocuments(__assign(__assign({}, filter), { employmentStatus: "On Leave" })),
                        Employee_js_1.default.aggregate([
                            { $match: filter },
                            { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
                        ]),
                        Employee_js_1.default.aggregate([
                            { $match: filter },
                            { $group: { _id: "$workMode", count: { $sum: 1 } } },
                        ]),
                    ])];
            case 1:
                _a = _b.sent(), totalEmployees = _a[0], activeEmployees = _a[1], onLeaveEmployees = _a[2], riskDistribution = _a[3], workModeDistribution = _a[4];
                statusDistribution = [
                    { name: "Active", value: activeEmployees },
                    { name: "On Leave", value: onLeaveEmployees },
                    { name: "Inactive", value: totalEmployees - activeEmployees - onLeaveEmployees }
                ];
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: {
                            totalEmployees: totalEmployees,
                            activeEmployees: activeEmployees,
                            statusDistribution: statusDistribution,
                            riskDistribution: riskDistribution.map(function (r) { return ({ name: r._id || "Low", value: r.count }); }),
                            workModeDistribution: workModeDistribution.map(function (w) { return ({ name: w._id || "Office", value: w.count }); }),
                        },
                    })];
            case 2:
                error_1 = _b.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_1.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getWorkforceAnalytics = getWorkforceAnalytics;
var getHiringAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, filter, hiringTrends, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                filter = __assign(__assign({}, scopeFilter), { role: "Employee" });
                return [4 /*yield*/, Employee_js_1.default.aggregate([
                        { $match: filter },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m", date: "$joiningDate" } },
                                hires: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ])];
            case 1:
                hiringTrends = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: hiringTrends.map(function (item) { return ({ month: item._id, hires: item.hires }); }),
                    })];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_2.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHiringAnalytics = getHiringAnalytics;
var getAttendanceAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, validEmployeeIds, attendanceStats, trends, formattedTrends, formattedSummary, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                return [4 /*yield*/, Employee_js_1.default.find(__assign(__assign({}, scopeFilter), { role: "Employee" })).distinct("_id")];
            case 1:
                validEmployeeIds = _a.sent();
                return [4 /*yield*/, AttendanceRecord_js_1.default.aggregate([
                        { $match: { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                                avgWorkMinutes: { $avg: "$workDurationMinutes" },
                                avgLateMinutes: { $avg: "$lateMinutes" },
                                totalOvertimeMinutes: { $sum: "$overtimeMinutes" },
                            },
                        },
                    ])];
            case 2:
                attendanceStats = _a.sent();
                return [4 /*yield*/, AttendanceRecord_js_1.default.aggregate([
                        { $match: { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
                        {
                            $group: {
                                _id: "$date",
                                present: { $sum: { $cond: [{ $in: ["$status", ["Working", "On Break", "Checked Out"]] }, 1, 0] } },
                                late: { $sum: { $cond: [{ $gt: ["$lateMinutes", 0] }, 1, 0] } },
                                total: { $sum: 1 },
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 7 }
                    ])];
            case 3:
                trends = _a.sent();
                formattedTrends = trends.map(function (t) { return ({
                    date: t._id,
                    present: t.present,
                    late: t.late,
                    total: t.total,
                    attendanceRate: t.total > 0 ? (t.present / t.total) * 100 : 0
                }); });
                formattedSummary = attendanceStats.map(function (s) { return (__assign(__assign({}, s), { totalOvertimeMinutes: s.totalOvertimeMinutes || 0 })); });
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: { summary: formattedSummary, trends: formattedTrends.reverse() },
                    })];
            case 4:
                error_3 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_3.message })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getAttendanceAnalytics = getAttendanceAnalytics;
var getDepartmentAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, filter, deptStats, locationStats, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                filter = __assign(__assign({}, scopeFilter), { role: "Employee" });
                return [4 /*yield*/, Employee_js_1.default.aggregate([
                        { $match: filter },
                        {
                            $lookup: {
                                from: "departments",
                                localField: "departmentId",
                                foreignField: "_id",
                                as: "department",
                            },
                        },
                        { $unwind: "$department" },
                        {
                            $group: {
                                _id: "$department.name",
                                employeeCount: { $sum: 1 },
                            },
                        },
                    ])];
            case 1:
                deptStats = _a.sent();
                return [4 /*yield*/, Employee_js_1.default.aggregate([
                        { $match: filter },
                        {
                            $lookup: {
                                from: "locations",
                                localField: "locationId",
                                foreignField: "_id",
                                as: "location",
                            },
                        },
                        { $unwind: "$location" },
                        {
                            $group: {
                                _id: "$location.code",
                                employeeCount: { $sum: 1 },
                            },
                        },
                    ])];
            case 2:
                locationStats = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: {
                            departments: deptStats.map(function (d) { return ({ name: d._id, count: d.employeeCount }); }),
                            locations: locationStats.map(function (l) { return ({ code: l._id, count: l.employeeCount }); }),
                        },
                    })];
            case 3:
                error_4 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_4.message })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getDepartmentAnalytics = getDepartmentAnalytics;
var getSkillsAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, validEmployeeIds, skillGaps, employeesWithSkills, coveragePercentage, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                return [4 /*yield*/, Employee_js_1.default.find(__assign(__assign({}, scopeFilter), { role: "Employee" })).distinct("_id")];
            case 1:
                validEmployeeIds = _a.sent();
                return [4 /*yield*/, EmployeeSkill_js_1.default.aggregate([
                        { $match: { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
                        {
                            $lookup: {
                                from: "skills",
                                localField: "skillId",
                                foreignField: "_id",
                                as: "skill",
                            },
                        },
                        { $unwind: "$skill" },
                        {
                            $group: {
                                _id: "$skill.name",
                                avgProficiency: { $avg: "$proficiencyLevel" },
                                employeeCount: { $sum: 1 },
                            },
                        },
                    ])];
            case 2:
                skillGaps = _a.sent();
                return [4 /*yield*/, EmployeeSkill_js_1.default.distinct("employeeId", { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } })];
            case 3:
                employeesWithSkills = _a.sent();
                coveragePercentage = validEmployeeIds.length > 0 ? Math.round((employeesWithSkills.length / validEmployeeIds.length) * 100) : 0;
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: {
                            skills: skillGaps.map(function (s) { return ({
                                name: s._id,
                                category: "General", // Placeholder if missing
                                count: s.employeeCount,
                                experts: Math.floor(s.employeeCount * (s.avgProficiency / 100)), // Approximate
                            }); }),
                            coveragePercentage: coveragePercentage,
                        }
                    })];
            case 4:
                error_5 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_5.message })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getSkillsAnalytics = getSkillsAnalytics;
var getPerformanceAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, validEmployeeIds, perfData, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                return [4 /*yield*/, Employee_js_1.default.find(__assign(__assign({}, scopeFilter), { role: "Employee" })).distinct("_id")];
            case 1:
                validEmployeeIds = _a.sent();
                return [4 /*yield*/, PerformanceRecord_js_1.default.aggregate([
                        { $match: { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
                        {
                            $group: {
                                _id: "$period",
                                avgRating: { $avg: "$rating" },
                                totalReviews: { $sum: 1 },
                                completedGoals: { $sum: "$goalsCompleted" }
                            },
                        },
                        { $sort: { _id: 1 } },
                    ])];
            case 2:
                perfData = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: perfData.map(function (p) { return ({
                            month: p._id,
                            avgRating: Math.round(p.avgRating * 100) / 100,
                            avgKpiScore: Math.round(p.avgRating * 20), // Map 1-5 rating to 0-100 score
                            completedGoals: p.completedGoals || 0,
                        }); }),
                    })];
            case 3:
                error_6 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_6.message })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getPerformanceAnalytics = getPerformanceAnalytics;
var getProductivityAnalytics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scopeFilter, validEmployeeIds, productivity, avgProductivityScore, avgActiveHours, totalTasksCompleted, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                scopeFilter = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, new mongoose_1.default.Types.ObjectId(req.companyId));
                return [4 /*yield*/, Employee_js_1.default.find(__assign(__assign({}, scopeFilter), { role: "Employee" })).distinct("_id")];
            case 1:
                validEmployeeIds = _a.sent();
                return [4 /*yield*/, ProductivityRecord_js_1.default.aggregate([
                        { $match: { companyId: new mongoose_1.default.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
                        {
                            $group: {
                                _id: "$date",
                                avgEfficiency: { $avg: "$efficiencyScore" },
                                avgHours: { $avg: "$hoursLogged" },
                                totalTasks: { $sum: "$tasksCompleted" }
                            },
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 30 },
                    ])];
            case 2:
                productivity = _a.sent();
                avgProductivityScore = productivity.length > 0 ? productivity.reduce(function (acc, p) { return acc + p.avgEfficiency; }, 0) / productivity.length : 0;
                avgActiveHours = productivity.length > 0 ? productivity.reduce(function (acc, p) { return acc + p.avgHours; }, 0) / productivity.length : 0;
                totalTasksCompleted = productivity.reduce(function (acc, p) { return acc + (p.totalTasks || 0); }, 0);
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: {
                            avgProductivityScore: Math.round(avgProductivityScore),
                            avgFocusScore: Math.round(avgProductivityScore * 0.9), // Note: No focus score field exists in ProductivityRecord schema
                            avgActiveHours: Math.round(avgActiveHours * 10) / 10,
                            totalTasksCompleted: totalTasksCompleted,
                        },
                    })];
            case 3:
                error_7 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_7.message })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getProductivityAnalytics = getProductivityAnalytics;
var streamAnalytics = function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    var sendEvent = function (data) {
        res.write("data: ".concat(JSON.stringify(data), "\n\n"));
    };
    // Initial connection message
    sendEvent({ type: 'connected', message: 'SSE connection established' });
    // Event listener
    var updateListener = function (data) {
        // Only send the event if it matches the current user's tenant/company
        if (!data.companyId || (req.companyId && data.companyId.toString() === req.companyId.toString())) {
            sendEvent(data);
        }
    };
    eventBus_js_1.eventBus.on('analytics:update', updateListener);
    req.on('close', function () {
        eventBus_js_1.eventBus.off('analytics:update', updateListener);
    });
};
exports.streamAnalytics = streamAnalytics;
