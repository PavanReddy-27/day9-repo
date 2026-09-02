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
exports.getEmployeeById = exports.getEmployees = exports.getTeams = exports.getDepartments = exports.getLocations = void 0;
var Location_js_1 = __importDefault(require("../models/Location.js"));
var Department_js_1 = __importDefault(require("../models/Department.js"));
var Team_js_1 = __importDefault(require("../models/Team.js"));
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
// Registering the Shift model is required so `.populate("shiftId")` in
// getEmployees/getEmployeeById can resolve it. Without this import Mongoose
// throws "Schema hasn't been registered for model 'Shift'" -> 500 on every
// employee list/detail request.
require("../models/Shift.js");
var PerformanceRecord_js_1 = __importDefault(require("../models/PerformanceRecord.js"));
var ProductivityRecord_js_1 = __importDefault(require("../models/ProductivityRecord.js"));
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
// Attaches REAL performance (avg rating/KPI) and productivity (avg efficiency)
// to a list of lean employee docs, aggregated from their records. Returns the
// same array mutated in place. Keeps the list endpoint's response truthful
// instead of the UI showing hardcoded "Good"/85 placeholders.
var enrichWithScores = function (employees) { return __awaiter(void 0, void 0, void 0, function () {
    var ids, _a, perf, prod, perfMap, prodMap, label, _i, employees_1, e, p, pr, perfScore;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!employees.length)
                    return [2 /*return*/, employees];
                ids = employees.map(function (e) { return e._id; });
                return [4 /*yield*/, Promise.all([
                        PerformanceRecord_js_1.default.aggregate([
                            { $match: { employeeId: { $in: ids } } },
                            { $group: { _id: "$employeeId", avgRating: { $avg: "$rating" }, avgKpi: { $avg: "$kpiScore" } } },
                        ]),
                        ProductivityRecord_js_1.default.aggregate([
                            { $match: { employeeId: { $in: ids } } },
                            { $group: { _id: "$employeeId", avgEff: { $avg: { $ifNull: ["$productivityScore", "$efficiencyScore"] } } } },
                        ]),
                    ])];
            case 1:
                _a = _b.sent(), perf = _a[0], prod = _a[1];
                perfMap = new Map(perf.map(function (p) { return [String(p._id), p]; }));
                prodMap = new Map(prod.map(function (p) { return [String(p._id), p]; }));
                label = function (score) { return (score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Average"); };
                for (_i = 0, employees_1 = employees; _i < employees_1.length; _i++) {
                    e = employees_1[_i];
                    p = perfMap.get(String(e._id));
                    pr = prodMap.get(String(e._id));
                    perfScore = p ? Math.round(p.avgKpi || (p.avgRating || 0) * 20) : 0;
                    e.performanceScore = perfScore;
                    e.performance = perfScore ? label(perfScore) : "Average";
                    e.productivity = pr ? Math.round(pr.avgEff || 0) : 0;
                }
                return [2 /*return*/, employees];
        }
    });
}); };
var getLocations = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var locations, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Location_js_1.default.find({ companyId: req.companyId, isActive: true }).lean()];
            case 1:
                locations = _a.sent();
                return [2 /*return*/, res.status(200).json({ success: true, data: locations })];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_1.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getLocations = getLocations;
var getDepartments = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filter, departments, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filter = { companyId: req.companyId };
                if (req.query.locationId)
                    filter.locationId = req.query.locationId;
                return [4 /*yield*/, Department_js_1.default.find(filter).populate("locationId").lean()];
            case 1:
                departments = _a.sent();
                return [2 /*return*/, res.status(200).json({ success: true, data: departments })];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_2.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getDepartments = getDepartments;
var getTeams = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filter, teams, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filter = { companyId: req.companyId };
                if (req.query.departmentId)
                    filter.departmentId = req.query.departmentId;
                return [4 /*yield*/, Team_js_1.default.find(filter).populate("departmentId").lean()];
            case 1:
                teams = _a.sent();
                return [2 /*return*/, res.status(200).json({ success: true, data: teams })];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_3.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTeams = getTeams;
var getEmployees = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, locationId, departmentId, teamId, role, employmentStatus, riskLevel, _b, page, _c, limit, _d, sortBy, _e, sortOrder, query, searchRegex, skip, sortOptions, _f, employees, total, error_4;
    var _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 3, , 4]);
                _a = req.query, search = _a.search, locationId = _a.locationId, departmentId = _a.departmentId, teamId = _a.teamId, role = _a.role, employmentStatus = _a.employmentStatus, riskLevel = _a.riskLevel, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 50 : _c, _d = _a.sortBy, sortBy = _d === void 0 ? "createdAt" : _d, _e = _a.sortOrder, sortOrder = _e === void 0 ? "desc" : _e;
                query = {};
                if (search) {
                    searchRegex = new RegExp(String(search).trim(), "i");
                    query.$or = [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { fullName: searchRegex },
                        { email: searchRegex },
                        { employeeId: searchRegex },
                        { designation: searchRegex },
                    ];
                }
                // User-supplied narrowing filters first...
                if (locationId)
                    query.locationId = locationId;
                if (departmentId)
                    query.departmentId = departmentId;
                if (teamId)
                    query.teamId = teamId;
                if (role)
                    query.role = role;
                if (employmentStatus)
                    query.employmentStatus = employmentStatus;
                if (riskLevel)
                    query.riskLevel = riskLevel;
                // ...then the authoritative RBAC scope is applied LAST so it always wins.
                // This enforces company isolation and pins Manager->department,
                // Employee->self even if the client passes conflicting
                // locationId/departmentId query params.
                Object.assign(query, (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee, req.companyId));
                skip = (Math.max(1, parseInt(String(page))) - 1) * parseInt(String(limit));
                sortOptions = (_g = {}, _g[String(sortBy)] = sortOrder === "asc" ? 1 : -1, _g);
                return [4 /*yield*/, Promise.all([
                        Employee_js_1.default.find(query)
                            .populate("locationId departmentId teamId managerId shiftId")
                            .sort(sortOptions)
                            .skip(skip)
                            .limit(parseInt(String(limit)))
                            .lean(),
                        Employee_js_1.default.countDocuments(query),
                    ])];
            case 1:
                _f = _h.sent(), employees = _f[0], total = _f[1];
                return [4 /*yield*/, enrichWithScores(employees)];
            case 2:
                _h.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        data: employees,
                        pagination: {
                            total: total,
                            page: parseInt(String(page)),
                            limit: parseInt(String(limit)),
                            totalPages: Math.ceil(total / parseInt(String(limit))),
                        },
                    })];
            case 3:
                error_4 = _h.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_4.message })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getEmployees = getEmployees;
var getEmployeeById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, employee, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, Employee_js_1.default.findOne({ _id: id, companyId: req.companyId })
                        .populate("locationId departmentId teamId managerId shiftId")
                        .lean()];
            case 1:
                employee = _a.sent();
                if (!employee) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Employee record not found." })];
                }
                // Role scope check
                if (req.role === "Manager" && employee.departmentId._id.toString() !== req.employee.departmentId.toString()) {
                    return [2 /*return*/, res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your department." })];
                }
                if (req.role === "Employee" && employee._id.toString() !== req.employee._id.toString()) {
                    return [2 /*return*/, res.status(403).json({ success: false, message: "Forbidden: Cannot access another employee's record." })];
                }
                return [2 /*return*/, res.status(200).json({ success: true, data: employee })];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_5.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getEmployeeById = getEmployeeById;
