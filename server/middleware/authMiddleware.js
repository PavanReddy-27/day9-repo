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
exports.validateObjectId = exports.buildEmployeeScopeFilter = exports.applyRoleDataScope = exports.requireRole = exports.authenticateJWT = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = __importDefault(require("mongoose"));
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
var TokenBlacklist_js_1 = __importDefault(require("../models/TokenBlacklist.js"));
var User_js_1 = require("../models/User.js");
var findUserById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_js_1.AdminAuth.findById(id)];
            case 1:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.HRAuth.findById(id)];
            case 2:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.ManagerAuth.findById(id)];
            case 3:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.EmployeeAuth.findById(id)];
            case 4:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [2 /*return*/, null];
        }
    });
}); };
var authenticateJWT = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, isBlacklisted, decoded, userDoc, employeeDoc, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                token = void 0;
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                    token = req.headers.authorization.split(' ')[1];
                }
                else if (req.query.token) {
                    token = req.query.token;
                }
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Not authorized, no token' })];
                }
                return [4 /*yield*/, TokenBlacklist_js_1.default.findOne({ token: token })];
            case 1:
                isBlacklisted = _a.sent();
                if (isBlacklisted) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Not authorized, token revoked' })];
                }
                decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                req.user = decoded; // { id, role }
                return [4 /*yield*/, findUserById(decoded.id)];
            case 2:
                userDoc = _a.sent();
                if (!userDoc) return [3 /*break*/, 8];
                employeeDoc = null;
                return [4 /*yield*/, Employee_js_1.default.findOne({
                        $or: [
                            { employeeId: userDoc.employeeId },
                            { userId: userDoc._id },
                            { email: userDoc.email }
                        ]
                    })];
            case 3:
                // Try matching by employeeId, userId (_id), or email
                employeeDoc = _a.sent();
                if (!(!employeeDoc && userDoc.email)) return [3 /*break*/, 5];
                return [4 /*yield*/, Employee_js_1.default.findOne({ email: userDoc.email })];
            case 4:
                employeeDoc = _a.sent();
                _a.label = 5;
            case 5:
                if (!(!employeeDoc && mongoose_1.default.Types.ObjectId.isValid(decoded.id))) return [3 /*break*/, 7];
                return [4 /*yield*/, Employee_js_1.default.findById(decoded.id)];
            case 6:
                employeeDoc = _a.sent();
                _a.label = 7;
            case 7:
                // If no employee record is found, we fall through. 
                // The else block below will assign a safe dummy ID.
                if (employeeDoc) {
                    req.employee = {
                        _id: employeeDoc._id,
                        locationId: employeeDoc.locationId,
                        departmentId: employeeDoc.departmentId,
                        teamId: employeeDoc.teamId,
                        workMode: employeeDoc.workMode,
                    };
                }
                else {
                    req.employee = { _id: new mongoose_1.default.Types.ObjectId("000000000000000000000000") };
                }
                req.companyId = employeeDoc ? employeeDoc.companyId : userDoc.companyId;
                req.role = userDoc.role;
                req.userEmail = userDoc.email;
                _a.label = 8;
            case 8:
                next();
                return [3 /*break*/, 10];
            case 9:
                error_1 = _a.sent();
                console.error('[AuthMiddleware] Token verification failed:', error_1);
                res.status(401).json({ success: false, message: 'Not authorized, token failed' });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.authenticateJWT = authenticateJWT;
var requireRole = function (roles) {
    return function (req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
var applyRoleDataScope = function (req, res, next) {
    // Used by attendance history, where the self-scope field is `employeeId`
    // (which stores the Employee ObjectId on attendancerecords).
    if (req.role === 'Employee') {
        req.scopeFilter = { employeeId: req.employee._id };
    }
    else {
        req.scopeFilter = {};
    }
    next();
};
exports.applyRoleDataScope = applyRoleDataScope;
/**
 * Builds the authoritative Mongo filter that scopes a query against the
 * `employees` collection to what the authenticated principal may see.
 * Always company-isolated; Managers are pinned to their department,
 * and Employees to their own record. Admin/HR see the whole
 * (authorized) company. This is a pure function so it can be unit-tested
 * against the real production logic.
 */
var buildEmployeeScopeFilter = function (role, employee, companyId) {
    var filter = { companyId: companyId };
    if (role === 'Manager') {
        // Managers are scoped to their own department.
        filter.departmentId = employee === null || employee === void 0 ? void 0 : employee.departmentId;
    }
    else if (role !== 'Admin' && role !== 'HR') {
        // Standard employees can only see their own record.
        filter._id = employee === null || employee === void 0 ? void 0 : employee._id;
    }
    // Admin / HR: company-wide.
    return filter;
};
exports.buildEmployeeScopeFilter = buildEmployeeScopeFilter;
var validateObjectId = function (param) {
    return function (req, res, next) {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params[param])) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        next();
    };
};
exports.validateObjectId = validateObjectId;
