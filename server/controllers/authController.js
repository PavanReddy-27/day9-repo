"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.disableMfa = exports.enableMfa = exports.generateMfaSetup = exports.verifyLoginMfa = exports.logout = exports.refresh = exports.login = exports.generateTokens = void 0;
var User_js_1 = require("../models/User.js");
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var audit_js_1 = require("../utils/audit.js");
var TokenBlacklist_js_1 = __importDefault(require("../models/TokenBlacklist.js"));
var otplib_1 = require("otplib");
var qrcode_1 = __importDefault(require("qrcode"));
// Google Authenticator uses 30s TOTP steps. Allow ±1 step (±30s) so small clock
// drift between the phone and the server doesn't reject otherwise-valid codes.
otplib_1.authenticator.options = { window: 1 };
// Helper to generate tokens
var generateTokens = function (id, role) {
    var accessToken = jsonwebtoken_1.default.sign({ id: id, role: role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    var refreshToken = jsonwebtoken_1.default.sign({ id: id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken: accessToken, refreshToken: refreshToken };
};
exports.generateTokens = generateTokens;
var findUserByEmail = function (rawEmail) { return __awaiter(void 0, void 0, void 0, function () {
    var clean, domainVariants, _i, domainVariants_1, email, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!rawEmail)
                    return [2 /*return*/, null];
                clean = rawEmail.trim().toLowerCase();
                domainVariants = [clean];
                if (clean.includes("@company.com")) {
                    domainVariants.push(clean.replace("@company.com", "@thestackly.com"));
                    domainVariants.push(clean.replace("@company.com", "@stackly.com"));
                }
                else if (clean.includes("@stackly.com")) {
                    domainVariants.push(clean.replace("@stackly.com", "@thestackly.com"));
                    domainVariants.push(clean.replace("@stackly.com", "@company.com"));
                }
                else if (clean.includes("@thestackly.com")) {
                    domainVariants.push(clean.replace("@thestackly.com", "@company.com"));
                    domainVariants.push(clean.replace("@thestackly.com", "@stackly.com"));
                }
                _i = 0, domainVariants_1 = domainVariants;
                _a.label = 1;
            case 1:
                if (!(_i < domainVariants_1.length)) return [3 /*break*/, 8];
                email = domainVariants_1[_i];
                return [4 /*yield*/, User_js_1.AdminAuth.findOne({ email: email }).select('+password')];
            case 2:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.HRAuth.findOne({ email: email }).select('+password')];
            case 3:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.ManagerAuth.findOne({ email: email }).select('+password')];
            case 4:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.EmployeeAuth.findOne({ email: email }).select('+password')];
            case 5:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.User.findOne({ email: email }).select('+password')];
            case 6:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                _a.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 1];
            case 8: return [2 /*return*/, null];
        }
    });
}); };
var findUserById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_js_1.AdminAuth.findById(id).select('+mfaSecret')];
            case 1:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.HRAuth.findById(id).select('+mfaSecret')];
            case 2:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.ManagerAuth.findById(id).select('+mfaSecret')];
            case 3:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [4 /*yield*/, User_js_1.EmployeeAuth.findById(id).select('+mfaSecret')];
            case 4:
                user = _a.sent();
                if (user)
                    return [2 /*return*/, user];
                return [2 /*return*/, null];
        }
    });
}); };
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, cleanEmail, runSeed, sErr_1, _b, tempToken, employee, _c, accessToken, refreshToken, error_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 11, , 12]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'Please provide email and password' })];
                }
                return [4 /*yield*/, findUserByEmail(email)];
            case 1:
                user = _e.sent();
                if (!!user) return [3 /*break*/, 7];
                cleanEmail = (email || "").trim().toLowerCase();
                if (!(cleanEmail.includes("admin") || cleanEmail.includes("hr") || cleanEmail.includes("manager") || cleanEmail.includes("employee"))) return [3 /*break*/, 7];
                _e.label = 2;
            case 2:
                _e.trys.push([2, 6, , 7]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("../seed/seed.js")); })];
            case 3:
                runSeed = (_e.sent()).runSeed;
                return [4 /*yield*/, runSeed(false)];
            case 4:
                _e.sent();
                return [4 /*yield*/, findUserByEmail(email)];
            case 5:
                user = _e.sent();
                return [3 /*break*/, 7];
            case 6:
                sErr_1 = _e.sent();
                console.error("On-demand seed error:", sErr_1.message);
                return [3 /*break*/, 7];
            case 7:
                _b = !user;
                if (_b) return [3 /*break*/, 9];
                return [4 /*yield*/, user.matchPassword(password)];
            case 8:
                _b = !(_e.sent());
                _e.label = 9;
            case 9:
                if (_b) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Invalid credentials' })];
                }
                if (!user.isActive) {
                    return [2 /*return*/, res.status(403).json({ success: false, message: 'Account is deactivated' })];
                }
                if (user.mfaEnabled) {
                    tempToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, isMfaTemp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
                    return [2 /*return*/, res.status(200).json({
                            success: true,
                            data: { mfaRequired: true, tempToken: tempToken }
                        })];
                }
                return [4 /*yield*/, Employee_js_1.default.findOne({ email: email })];
            case 10:
                employee = _e.sent();
                _c = (0, exports.generateTokens)(user._id, user.role), accessToken = _c.accessToken, refreshToken = _c.refreshToken;
                // Sensitive-action audit trail (fire-and-forget).
                void (0, audit_js_1.writeAuditLog)({ companyId: (_d = employee === null || employee === void 0 ? void 0 : employee.companyId) !== null && _d !== void 0 ? _d : user.companyId, role: user.role, userEmail: user.email, ip: req.ip, headers: req.headers }, "LOGIN", "".concat(user.role, " ").concat(user.email, " signed in"), "Auth", String(user._id));
                res.status(200).json({
                    success: true,
                    data: {
                        _id: user._id,
                        id: user._id.toString(),
                        employeeId: user.employeeId,
                        email: user.email,
                        username: user.email,
                        role: user.role,
                        firstName: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'System',
                        lastName: (employee === null || employee === void 0 ? void 0 : employee.lastName) || 'User',
                        fullName: (employee === null || employee === void 0 ? void 0 : employee.fullName) || 'System User',
                        department: (employee === null || employee === void 0 ? void 0 : employee.departmentName) || (employee === null || employee === void 0 ? void 0 : employee.department) || 'General',
                        departmentId: employee === null || employee === void 0 ? void 0 : employee.departmentId,
                        designation: (employee === null || employee === void 0 ? void 0 : employee.designation) || user.role,
                        location: (employee === null || employee === void 0 ? void 0 : employee.locationCode) || (employee === null || employee === void 0 ? void 0 : employee.location) || 'HQ',
                        avatar: (employee === null || employee === void 0 ? void 0 : employee.avatar) || '',
                        isActive: user.isActive,
                        mfaEnabled: !!user.mfaEnabled,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    }
                });
                return [3 /*break*/, 12];
            case 11:
                error_1 = _e.sent();
                next(error_1);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var refresh = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, isBlacklisted, decoded, user, tokens, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                refreshToken = req.body.refreshToken;
                if (!refreshToken)
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Refresh token required' })];
                return [4 /*yield*/, TokenBlacklist_js_1.default.findOne({ token: refreshToken })];
            case 1:
                isBlacklisted = _b.sent();
                if (isBlacklisted)
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Refresh token revoked' })];
                decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                return [4 /*yield*/, findUserById(decoded.id)];
            case 2:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'User not found' })];
                return [4 /*yield*/, TokenBlacklist_js_1.default.create({ token: refreshToken })];
            case 3:
                _b.sent();
                tokens = (0, exports.generateTokens)(user._id, user.role);
                res.status(200).json({ success: true, data: tokens });
                return [3 /*break*/, 5];
            case 4:
                _a = _b.sent();
                res.status(403).json({ success: false, message: 'Invalid refresh token' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.refresh = refresh;
var logout = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tokensToBlacklist, accessToken, refreshToken, closeSSEConnection, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                tokensToBlacklist = [];
                accessToken = void 0;
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                    accessToken = req.headers.authorization.split(' ')[1];
                }
                if (accessToken)
                    tokensToBlacklist.push({ token: accessToken });
                refreshToken = (req.body || {}).refreshToken;
                if (refreshToken)
                    tokensToBlacklist.push({ token: refreshToken });
                if (!(tokensToBlacklist.length > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, TokenBlacklist_js_1.default.insertMany(tokensToBlacklist)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                if (!(req.user && req.user.id)) return [3 /*break*/, 4];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../utils/sse.js')); })];
            case 3:
                closeSSEConnection = (_a.sent()).closeSSEConnection;
                // For SSE clients, the id is typically the employee _id (or user _id if employee not found).
                closeSSEConnection(req.user.id);
                _a.label = 4;
            case 4:
                res.status(200).json({ success: true, message: 'Logged out successfully' });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.logout = logout;
var verifyLoginMfa = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tempToken, mfaToken, decoded, user, isValid, employee, _b, accessToken, refreshToken, error_3;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.body, tempToken = _a.tempToken, mfaToken = _a.mfaToken;
                if (!tempToken || !mfaToken) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'Missing temporary token or MFA code' })];
                }
                decoded = jsonwebtoken_1.default.verify(tempToken, process.env.JWT_SECRET);
                if (!decoded.isMfaTemp) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'Invalid temporary token' })];
                }
                return [4 /*yield*/, findUserById(decoded.id)];
            case 1:
                user = _d.sent();
                if (!user || !user.mfaEnabled || !user.mfaSecret) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'MFA is not enabled for this user' })];
                }
                isValid = otplib_1.authenticator.verify({ token: mfaToken, secret: user.mfaSecret });
                if (!isValid) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Invalid MFA code' })];
                }
                return [4 /*yield*/, Employee_js_1.default.findOne({ email: user.email })];
            case 2:
                employee = _d.sent();
                _b = (0, exports.generateTokens)(user._id, user.role), accessToken = _b.accessToken, refreshToken = _b.refreshToken;
                void (0, audit_js_1.writeAuditLog)({ companyId: (_c = employee === null || employee === void 0 ? void 0 : employee.companyId) !== null && _c !== void 0 ? _c : user.companyId, role: user.role, userEmail: user.email, ip: req.ip, headers: req.headers }, "LOGIN_MFA", "".concat(user.role, " ").concat(user.email, " signed in with MFA"), "Auth", String(user._id));
                res.status(200).json({
                    success: true,
                    data: {
                        _id: user._id,
                        id: user._id.toString(),
                        employeeId: user.employeeId,
                        email: user.email,
                        username: user.email,
                        role: user.role,
                        firstName: (employee === null || employee === void 0 ? void 0 : employee.firstName) || 'System',
                        lastName: (employee === null || employee === void 0 ? void 0 : employee.lastName) || 'User',
                        fullName: (employee === null || employee === void 0 ? void 0 : employee.fullName) || 'System User',
                        department: (employee === null || employee === void 0 ? void 0 : employee.departmentName) || (employee === null || employee === void 0 ? void 0 : employee.department) || 'General',
                        departmentId: employee === null || employee === void 0 ? void 0 : employee.departmentId,
                        designation: (employee === null || employee === void 0 ? void 0 : employee.designation) || user.role,
                        location: (employee === null || employee === void 0 ? void 0 : employee.locationCode) || (employee === null || employee === void 0 ? void 0 : employee.location) || 'HQ',
                        avatar: (employee === null || employee === void 0 ? void 0 : employee.avatar) || '',
                        isActive: user.isActive,
                        mfaEnabled: !!user.mfaEnabled,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _d.sent();
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.verifyLoginMfa = verifyLoginMfa;
var generateMfaSetup = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userDoc, secret, otpauth, qrCodeDataUrl, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, findUserById(req.user.id)];
            case 1:
                userDoc = _a.sent();
                if (!userDoc) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: 'User not found' })];
                }
                if (userDoc.mfaEnabled) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'MFA is already enabled' })];
                }
                secret = otplib_1.authenticator.generateSecret();
                otpauth = otplib_1.authenticator.keyuri(userDoc.email, 'Workforce Analytics', secret);
                return [4 /*yield*/, qrcode_1.default.toDataURL(otpauth)];
            case 2:
                qrCodeDataUrl = _a.sent();
                res.status(200).json({
                    success: true,
                    data: { secret: secret, qrCodeDataUrl: qrCodeDataUrl }
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.generateMfaSetup = generateMfaSetup;
var enableMfa = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mfaToken, secret, isValid, userDoc, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, mfaToken = _a.mfaToken, secret = _a.secret;
                if (!mfaToken || !secret) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'MFA code and secret are required' })];
                }
                isValid = otplib_1.authenticator.verify({ token: mfaToken, secret: secret });
                if (!isValid) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: 'Invalid MFA code' })];
                }
                return [4 /*yield*/, findUserById(req.user.id)];
            case 1:
                userDoc = _b.sent();
                if (!userDoc) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: 'User not found' })];
                }
                userDoc.mfaSecret = secret;
                userDoc.mfaEnabled = true;
                return [4 /*yield*/, userDoc.save()];
            case 2:
                _b.sent();
                res.status(200).json({ success: true, message: 'MFA enabled successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _b.sent();
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.enableMfa = enableMfa;
var disableMfa = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userDoc, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, findUserById(req.user.id)];
            case 1:
                userDoc = _a.sent();
                if (!userDoc) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: 'User not found' })];
                }
                if (!userDoc.mfaEnabled) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: 'MFA is not enabled' })];
                }
                userDoc.mfaSecret = undefined;
                userDoc.mfaEnabled = false;
                return [4 /*yield*/, userDoc.save()];
            case 2:
                _a.sent();
                res.status(200).json({ success: true, message: 'MFA disabled successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                next(error_6);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.disableMfa = disableMfa;
