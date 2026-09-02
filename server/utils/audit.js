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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = void 0;
var AuditLog_js_1 = __importDefault(require("../models/AuditLog.js"));
/**
 * Writes a sensitive-action audit entry to MongoDB. Fire-and-forget: audit
 * failures must never break the primary request, so errors are swallowed.
 */
var writeAuditLog = function (req_1, action_1, details_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([req_1, action_1, details_1], args_1, true), void 0, function (req, action, details, entityType, entityId, opts) {
        var doc, _a;
        var _b, _c, _d, _e, _f;
        if (entityType === void 0) { entityType = ""; }
        if (entityId === void 0) { entityId = ""; }
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 5, , 6]);
                    doc = {
                        companyId: req.companyId,
                        performedBy: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) || ((_c = req.employee) === null || _c === void 0 ? void 0 : _c.email) || req.userEmail || "System",
                        userRole: req.role || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) || "Unknown",
                        action: action,
                        entityType: entityType,
                        entityId: String(entityId || ""),
                        details: details,
                        ipAddress: req.ip || ((_e = req.headers) === null || _e === void 0 ? void 0 : _e["x-forwarded-for"]) || "127.0.0.1",
                        userAgent: ((_f = req.headers) === null || _f === void 0 ? void 0 : _f["user-agent"]) || "",
                        timestamp: new Date(),
                    };
                    if (!(opts === null || opts === void 0 ? void 0 : opts.session)) return [3 /*break*/, 2];
                    return [4 /*yield*/, AuditLog_js_1.default.create([doc], { session: opts.session })];
                case 1:
                    _g.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, AuditLog_js_1.default.create(doc)];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    _a = _g.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.writeAuditLog = writeAuditLog;
