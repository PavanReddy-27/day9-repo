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
exports.rejectCorrection = exports.approveCorrection = exports.getCorrections = exports.createCorrection = exports.getAttendanceHistory = exports.getGlobalAttendance = exports.checkOut = exports.resumeWork = exports.startBreak = exports.checkIn = exports.getAttendanceStatus = void 0;
exports.calculateHaversineDistance = calculateHaversineDistance;
var AttendanceRecord_js_1 = __importDefault(require("../models/AttendanceRecord.js"));
var AttendanceEvent_js_1 = __importDefault(require("../models/AttendanceEvent.js"));
var BreakSession_js_1 = __importDefault(require("../models/BreakSession.js"));
var CorrectionRequest_js_1 = __importDefault(require("../models/CorrectionRequest.js"));
var ApprovalHistory_js_1 = __importDefault(require("../models/ApprovalHistory.js"));
var Location_js_1 = __importDefault(require("../models/Location.js"));
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
var mongoose_1 = __importDefault(require("mongoose"));
var IdempotencyRecord_js_1 = __importDefault(require("../models/IdempotencyRecord.js"));
var sse_js_1 = require("../utils/sse.js");
var audit_js_1 = require("../utils/audit.js");
// Haversine formula for geofence validation
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371000; // Radius of Earth in meters
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
var getTodayDateStr = function () { return new Date().toISOString().split("T")[0]; };
function safeStartSession() {
    return __awaiter(this, void 0, void 0, function () {
        var session, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (mongoose_1.default.connection.readyState !== 1)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mongoose_1.default.startSession()];
                case 2:
                    session = _b.sent();
                    session.startTransaction();
                    return [2 /*return*/, session];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function commitAndEndSession(session) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!session)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    if (!session.inTransaction()) return [3 /*break*/, 3];
                    return [4 /*yield*/, session.commitTransaction()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    try {
                        session.endSession();
                    }
                    catch (_c) { }
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function abortAndEndSession(session) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!session)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    if (!session.inTransaction()) return [3 /*break*/, 3];
                    return [4 /*yield*/, session.abortTransaction()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    try {
                        session.endSession();
                    }
                    catch (_c) { }
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Idempotency Middleware helper
function checkIdempotency(req, res, idempotencyKey, session) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!idempotencyKey)
                        return [2 /*return*/, null];
                    if (!session) return [3 /*break*/, 2];
                    return [4 /*yield*/, IdempotencyRecord_js_1.default.findOne({ companyId: req.companyId, idempotencyKey: idempotencyKey }).session(session)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, IdempotencyRecord_js_1.default.findOne({ companyId: req.companyId, idempotencyKey: idempotencyKey })];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    existing = _a;
                    if (existing) {
                        return [2 /*return*/, res.status(existing.responseStatus).json(existing.responseBody)];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function saveIdempotency(req, idempotencyKey, status, body, session) {
    return __awaiter(this, void 0, void 0, function () {
        var doc, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!idempotencyKey)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    doc = {
                        companyId: req.companyId,
                        idempotencyKey: idempotencyKey,
                        requestPath: req.originalUrl,
                        responseStatus: status,
                        responseBody: body,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    };
                    if (!session) return [3 /*break*/, 3];
                    return [4 /*yield*/, IdempotencyRecord_js_1.default.create([doc], { session: session })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, IdempotencyRecord_js_1.default.create(doc)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error("saveIdempotency error:", err_1);
                    if (err_1.code === 11000) {
                        throw new Error("IDEMPOTENCY_CONFLICT");
                    }
                    throw err_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
var getAttendanceStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var today, record, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                today = getTodayDateStr();
                return [4 /*yield*/, AttendanceRecord_js_1.default.findOne({
                        companyId: req.companyId,
                        employeeId: req.employee._id,
                        date: today,
                    }).lean()];
            case 1:
                record = _c.sent();
                if (!record) {
                    record = {
                        status: "Not Checked In",
                        date: today,
                        workDurationMinutes: 0,
                        breakDurationMinutes: 0,
                    };
                }
                else {
                    if (((_a = record.checkInCoordinates) === null || _a === void 0 ? void 0 : _a.lat) != null) {
                        record.location = { latitude: record.checkInCoordinates.lat, longitude: record.checkInCoordinates.lng };
                    }
                    if (((_b = record.checkOutCoordinates) === null || _b === void 0 ? void 0 : _b.lat) != null) {
                        record.checkOutLocation = { latitude: record.checkOutCoordinates.lat, longitude: record.checkOutCoordinates.lng };
                    }
                }
                return [2 /*return*/, res.status(200).json({ success: true, data: record })];
            case 2:
                error_1 = _c.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_1.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAttendanceStatus = getAttendanceStatus;
var checkIn = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, _a, coordinates, _b, source, _c, shiftType, idempotencyKey, isWFH, handled, today, query, record, resp, MAX_GPS_ACCURACY_METERS, location_1, distanceMeters, isGeofenced, actualWorkMode, currentLat, currentLng, targetLat, targetLng, requestedWorkMode, isWFHRequest, isWFHMode, allowedRadius, resp, now, currentHour, currentMinute, lateMinutes, isNightShift, responseBody, error_2;
    var _d, _e, _f, _g, _h, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0: return [4 /*yield*/, safeStartSession()];
            case 1:
                session = _m.sent();
                _m.label = 2;
            case 2:
                _m.trys.push([2, 25, , 27]);
                _a = req.body, coordinates = _a.location, _b = _a.source, source = _b === void 0 ? "Web" : _b, _c = _a.shiftType, shiftType = _c === void 0 ? "Regular" : _c, idempotencyKey = _a.idempotencyKey, isWFH = _a.isWFH;
                return [4 /*yield*/, checkIdempotency(req, res, idempotencyKey, session)];
            case 3:
                handled = _m.sent();
                if (!handled) return [3 /*break*/, 5];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 4:
                _m.sent();
                return [2 /*return*/];
            case 5:
                today = getTodayDateStr();
                query = AttendanceRecord_js_1.default.findOne({
                    companyId: req.companyId,
                    employeeId: req.employee._id,
                    date: today,
                }).sort({ createdAt: -1 });
                if (session)
                    query = query.session(session);
                return [4 /*yield*/, query];
            case 6:
                record = _m.sent();
                if (!(record && record.status !== "Not Checked In")) return [3 /*break*/, 8];
                resp = { success: false, message: "Cannot check in: You have already checked in today (Status: ".concat(record.status, ").") };
                return [4 /*yield*/, abortAndEndSession(session)];
            case 7:
                _m.sent();
                return [2 /*return*/, res.status(400).json(resp)];
            case 8:
                MAX_GPS_ACCURACY_METERS = 500;
                if (!((coordinates === null || coordinates === void 0 ? void 0 : coordinates.accuracy) != null && coordinates.accuracy > MAX_GPS_ACCURACY_METERS)) return [3 /*break*/, 10];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 9:
                _m.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: "GPS reading is too inaccurate (\u00B1".concat(Math.round(coordinates.accuracy), "m) to verify your location. Please try again with a stronger signal."),
                    })];
            case 10: return [4 /*yield*/, Location_js_1.default.findOne({ _id: req.employee.locationId, companyId: req.companyId })];
            case 11:
                location_1 = _m.sent();
                distanceMeters = 0;
                isGeofenced = true;
                actualWorkMode = "Office";
                if (!(location_1 && coordinates && (coordinates.latitude != null || coordinates.lat != null))) return [3 /*break*/, 16];
                currentLat = (_d = coordinates.latitude) !== null && _d !== void 0 ? _d : coordinates.lat;
                currentLng = (_e = coordinates.longitude) !== null && _e !== void 0 ? _e : coordinates.lng;
                targetLat = (_g = (_f = location_1.coordinates) === null || _f === void 0 ? void 0 : _f.latitude) !== null && _g !== void 0 ? _g : (_h = location_1.coordinates) === null || _h === void 0 ? void 0 : _h.lat;
                targetLng = (_k = (_j = location_1.coordinates) === null || _j === void 0 ? void 0 : _j.longitude) !== null && _k !== void 0 ? _k : (_l = location_1.coordinates) === null || _l === void 0 ? void 0 : _l.lng;
                if (!(targetLat != null && targetLng != null)) return [3 /*break*/, 16];
                distanceMeters = calculateHaversineDistance(currentLat, currentLng, targetLat, targetLng);
                requestedWorkMode = req.body.workMode;
                isWFHRequest = requestedWorkMode === "Work From Home" || requestedWorkMode === "Remote" || isWFH;
                isWFHMode = isWFHRequest || req.employee.workMode === "Remote" || req.employee.workMode === "Hybrid";
                allowedRadius = location_1.geofenceRadiusMeters || location_1.radiusMeters || 500;
                if (!(!isWFHMode && req.employee.workMode === "Office" && distanceMeters > allowedRadius)) return [3 /*break*/, 15];
                if (!isWFH) return [3 /*break*/, 12];
                actualWorkMode = "WFH";
                isGeofenced = false;
                return [3 /*break*/, 14];
            case 12:
                resp = {
                    success: false,
                    message: "OUTSIDE_GEOFENCE",
                    distance: Math.round(distanceMeters)
                };
                return [4 /*yield*/, abortAndEndSession(session)];
            case 13:
                _m.sent();
                return [2 /*return*/, res.status(403).json(resp)];
            case 14: return [3 /*break*/, 16];
            case 15:
                if (isWFHMode) {
                    actualWorkMode = "WFH";
                    isGeofenced = false;
                }
                _m.label = 16;
            case 16:
                now = new Date();
                currentHour = now.getHours();
                currentMinute = now.getMinutes();
                lateMinutes = 0;
                isNightShift = shiftType === "Night" || shiftType === "CrossMidnight";
                if (shiftType === "Flexible") {
                    lateMinutes = 0;
                }
                else if (isNightShift) {
                    lateMinutes = Math.max(0, (currentHour * 60 + currentMinute) - (20 * 60));
                }
                else {
                    lateMinutes = Math.max(0, (currentHour * 60 + currentMinute) - (9 * 60));
                }
                if (!record) {
                    record = new AttendanceRecord_js_1.default({
                        companyId: req.companyId,
                        employeeId: req.employee._id,
                        locationId: req.employee.locationId,
                        date: today,
                        checkInTime: now,
                        status: "Working",
                        shiftKind: shiftType,
                        isNightShift: isNightShift,
                        workMode: actualWorkMode,
                        lateMinutes: lateMinutes,
                        checkInCoordinates: coordinates ? { lat: coordinates.latitude || coordinates.lat, lng: coordinates.longitude || coordinates.lng } : undefined,
                    });
                }
                else {
                    record.checkInTime = now;
                    record.status = "Working";
                    record.workMode = actualWorkMode;
                    record.shiftKind = shiftType;
                    record.isNightShift = isNightShift;
                    if (!record.lateMinutes)
                        record.lateMinutes = lateMinutes;
                    if (coordinates) {
                        record.checkInCoordinates = { lat: coordinates.latitude || coordinates.lat, lng: coordinates.longitude || coordinates.lng };
                    }
                }
                if (!session) return [3 /*break*/, 19];
                return [4 /*yield*/, record.save({ session: session })];
            case 17:
                _m.sent();
                return [4 /*yield*/, AttendanceEvent_js_1.default.create([{
                            companyId: req.companyId,
                            attendanceRecordId: record._id,
                            employeeId: req.employee._id,
                            eventType: "CHECK_IN",
                            timestamp: now,
                            locationCoordinates: coordinates,
                            gpsAccuracy: (coordinates === null || coordinates === void 0 ? void 0 : coordinates.accuracy) || 0,
                            isGeofenced: isGeofenced,
                            distanceMeters: distanceMeters,
                            idempotencyKey: idempotencyKey,
                        }], { session: session })];
            case 18:
                _m.sent();
                return [3 /*break*/, 22];
            case 19: return [4 /*yield*/, record.save()];
            case 20:
                _m.sent();
                return [4 /*yield*/, AttendanceEvent_js_1.default.create({
                        companyId: req.companyId,
                        attendanceRecordId: record._id,
                        employeeId: req.employee._id,
                        eventType: "CHECK_IN",
                        timestamp: now,
                        locationCoordinates: coordinates,
                        gpsAccuracy: (coordinates === null || coordinates === void 0 ? void 0 : coordinates.accuracy) || 0,
                        isGeofenced: isGeofenced,
                        distanceMeters: distanceMeters,
                        idempotencyKey: idempotencyKey,
                    })];
            case 21:
                _m.sent();
                _m.label = 22;
            case 22:
                responseBody = { success: true, message: "Check-in successful.", data: record };
                return [4 /*yield*/, saveIdempotency(req, idempotencyKey, 200, responseBody, session)];
            case 23:
                _m.sent();
                return [4 /*yield*/, commitAndEndSession(session)];
            case 24:
                _m.sent();
                (0, sse_js_1.broadcastSSE)("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "CHECK_IN", recordId: record._id }, req.companyId);
                void (0, audit_js_1.writeAuditLog)(req, "ATTENDANCE_CHECK_IN", "Employee checked in for the day", "AttendanceRecord", record._id.toString());
                return [2 /*return*/, res.status(200).json(responseBody)];
            case 25:
                error_2 = _m.sent();
                return [4 /*yield*/, abortAndEndSession(session)];
            case 26:
                _m.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_2.message })];
            case 27: return [2 /*return*/];
        }
    });
}); };
exports.checkIn = checkIn;
var startBreak = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, idempotencyKey, handled, today, query, record, now, responseBody, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, safeStartSession()];
            case 1:
                session = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 21, , 23]);
                idempotencyKey = req.body.idempotencyKey;
                return [4 /*yield*/, checkIdempotency(req, res, idempotencyKey, session)];
            case 3:
                handled = _a.sent();
                if (!handled) return [3 /*break*/, 5];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 4:
                _a.sent();
                return [2 /*return*/];
            case 5:
                today = getTodayDateStr();
                query = AttendanceRecord_js_1.default.findOne({
                    companyId: req.companyId,
                    employeeId: req.employee._id,
                    date: today,
                });
                if (session)
                    query = query.session(session);
                return [4 /*yield*/, query];
            case 6:
                record = _a.sent();
                if (!(!record || record.status === "Not Checked In")) return [3 /*break*/, 8];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 7:
                _a.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Cannot start break: Employee has not checked in yet." })];
            case 8:
                if (!(record.status === "On Break")) return [3 /*break*/, 10];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 9:
                _a.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Already on break." })];
            case 10:
                if (!(record.status === "Checked Out")) return [3 /*break*/, 12];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 11:
                _a.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Cannot start break: Shift has already ended." })];
            case 12:
                now = new Date();
                record.status = "On Break";
                record.breakStartTime = now;
                if (!session) return [3 /*break*/, 15];
                return [4 /*yield*/, record.save({ session: session })];
            case 13:
                _a.sent();
                return [4 /*yield*/, BreakSession_js_1.default.create([{
                            companyId: req.companyId,
                            attendanceRecordId: record._id,
                            employeeId: req.employee._id,
                            startTime: now,
                        }], { session: session })];
            case 14:
                _a.sent();
                return [3 /*break*/, 18];
            case 15: return [4 /*yield*/, record.save()];
            case 16:
                _a.sent();
                return [4 /*yield*/, BreakSession_js_1.default.create({
                        companyId: req.companyId,
                        attendanceRecordId: record._id,
                        employeeId: req.employee._id,
                        startTime: now,
                    })];
            case 17:
                _a.sent();
                _a.label = 18;
            case 18:
                responseBody = { success: true, message: "Break started.", data: record };
                return [4 /*yield*/, saveIdempotency(req, idempotencyKey, 200, responseBody, session)];
            case 19:
                _a.sent();
                return [4 /*yield*/, commitAndEndSession(session)];
            case 20:
                _a.sent();
                (0, sse_js_1.broadcastSSE)("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "BREAK_STARTED", recordId: record._id }, req.companyId);
                void (0, audit_js_1.writeAuditLog)(req, "ATTENDANCE_BREAK_START", "Employee started a break", "AttendanceRecord", record._id.toString());
                return [2 /*return*/, res.status(200).json(responseBody)];
            case 21:
                error_3 = _a.sent();
                return [4 /*yield*/, abortAndEndSession(session)];
            case 22:
                _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_3.message })];
            case 23: return [2 /*return*/];
        }
    });
}); };
exports.startBreak = startBreak;
var resumeWork = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, idempotencyKey, handled, today, query, record, now, breakQuery, activeBreak, responseBody, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, safeStartSession()];
            case 1:
                session = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 21, , 23]);
                idempotencyKey = req.body.idempotencyKey;
                return [4 /*yield*/, checkIdempotency(req, res, idempotencyKey, session)];
            case 3:
                handled = _a.sent();
                if (!handled) return [3 /*break*/, 5];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 4:
                _a.sent();
                return [2 /*return*/];
            case 5:
                today = getTodayDateStr();
                query = AttendanceRecord_js_1.default.findOne({
                    companyId: req.companyId,
                    employeeId: req.employee._id,
                    date: today,
                });
                if (session)
                    query = query.session(session);
                return [4 /*yield*/, query];
            case 6:
                record = _a.sent();
                if (!(!record || record.status !== "On Break")) return [3 /*break*/, 8];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 7:
                _a.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Must be in 'On Break' state to resume work." })];
            case 8:
                now = new Date();
                breakQuery = BreakSession_js_1.default.findOne({
                    companyId: req.companyId,
                    attendanceRecordId: record._id,
                    endTime: null,
                });
                if (session)
                    breakQuery = breakQuery.session(session);
                return [4 /*yield*/, breakQuery];
            case 9:
                activeBreak = _a.sent();
                if (!activeBreak) return [3 /*break*/, 14];
                activeBreak.endTime = now;
                activeBreak.durationMinutes = Math.round((now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60));
                if (!session) return [3 /*break*/, 11];
                return [4 /*yield*/, activeBreak.save({ session: session })];
            case 10:
                _a.sent();
                return [3 /*break*/, 13];
            case 11: return [4 /*yield*/, activeBreak.save()];
            case 12:
                _a.sent();
                _a.label = 13;
            case 13:
                record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
                _a.label = 14;
            case 14:
                record.status = "Working";
                record.breakStartTime = null;
                if (!session) return [3 /*break*/, 16];
                return [4 /*yield*/, record.save({ session: session })];
            case 15:
                _a.sent();
                return [3 /*break*/, 18];
            case 16: return [4 /*yield*/, record.save()];
            case 17:
                _a.sent();
                _a.label = 18;
            case 18:
                responseBody = { success: true, message: "Resumed work.", data: record };
                return [4 /*yield*/, saveIdempotency(req, idempotencyKey, 200, responseBody, session)];
            case 19:
                _a.sent();
                return [4 /*yield*/, commitAndEndSession(session)];
            case 20:
                _a.sent();
                (0, sse_js_1.broadcastSSE)("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "WORK_RESUMED", recordId: record._id }, req.companyId);
                void (0, audit_js_1.writeAuditLog)(req, "ATTENDANCE_WORK_RESUME", "Employee resumed work from break", "AttendanceRecord", record._id.toString());
                return [2 /*return*/, res.status(200).json(responseBody)];
            case 21:
                error_4 = _a.sent();
                return [4 /*yield*/, abortAndEndSession(session)];
            case 22:
                _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_4.message })];
            case 23: return [2 /*return*/];
        }
    });
}); };
exports.resumeWork = resumeWork;
var checkOut = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, _a, coordinates, idempotencyKey, handled, today, query1, record, query2, now, breakQ, activeBreak, checkInDate, totalElapsedMinutes, netWorkMinutes, overtimeMinutes, currentHour, currentMinute, earlyDepartureMinutes, responseBody, error_5, existing;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, safeStartSession()];
            case 1:
                session = _d.sent();
                _d.label = 2;
            case 2:
                _d.trys.push([2, 27, , 32]);
                _a = req.body, coordinates = _a.location, idempotencyKey = _a.idempotencyKey;
                return [4 /*yield*/, checkIdempotency(req, res, idempotencyKey, session)];
            case 3:
                handled = _d.sent();
                if (!handled) return [3 /*break*/, 5];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 4:
                _d.sent();
                return [2 /*return*/];
            case 5:
                today = getTodayDateStr();
                query1 = AttendanceRecord_js_1.default.findOne({
                    companyId: req.companyId,
                    employeeId: req.employee._id,
                    date: today,
                }).sort({ createdAt: -1 });
                if (session)
                    query1 = query1.session(session);
                return [4 /*yield*/, query1];
            case 6:
                record = _d.sent();
                if (!(!record || record.status === "Checked Out")) return [3 /*break*/, 8];
                query2 = AttendanceRecord_js_1.default.findOne({
                    companyId: req.companyId,
                    employeeId: req.employee._id,
                    status: { $in: ["Working", "On Break"] }
                }).sort({ createdAt: -1 });
                if (session)
                    query2 = query2.session(session);
                return [4 /*yield*/, query2];
            case 7:
                record = _d.sent();
                _d.label = 8;
            case 8:
                if (!(!record || record.status === "Not Checked In")) return [3 /*break*/, 10];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 9:
                _d.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Cannot check out: Employee has not checked in yet." })];
            case 10:
                if (!(record.status === "Checked Out")) return [3 /*break*/, 12];
                return [4 /*yield*/, abortAndEndSession(session)];
            case 11:
                _d.sent();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Cannot check out: Employee has already checked out." })];
            case 12:
                now = new Date();
                if (!(record.status === "On Break")) return [3 /*break*/, 18];
                breakQ = BreakSession_js_1.default.findOne({
                    companyId: req.companyId,
                    attendanceRecordId: record._id,
                    endTime: null,
                });
                if (session)
                    breakQ = breakQ.session(session);
                return [4 /*yield*/, breakQ];
            case 13:
                activeBreak = _d.sent();
                if (!activeBreak) return [3 /*break*/, 18];
                activeBreak.endTime = now;
                activeBreak.durationMinutes = Math.round((now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60));
                if (!session) return [3 /*break*/, 15];
                return [4 /*yield*/, activeBreak.save({ session: session })];
            case 14:
                _d.sent();
                return [3 /*break*/, 17];
            case 15: return [4 /*yield*/, activeBreak.save()];
            case 16:
                _d.sent();
                _d.label = 17;
            case 17:
                record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
                _d.label = 18;
            case 18:
                record.checkOutTime = now;
                record.status = "Checked Out";
                record.breakStartTime = null;
                if (coordinates && (coordinates.latitude || coordinates.lat)) {
                    record.checkOutCoordinates = {
                        lat: coordinates.latitude || coordinates.lat,
                        lng: coordinates.longitude || coordinates.lng,
                    };
                }
                else if (record.checkInCoordinates) {
                    record.checkOutCoordinates = record.checkInCoordinates;
                }
                checkInDate = record.checkInTime ? new Date(record.checkInTime) : now;
                totalElapsedMinutes = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60)));
                netWorkMinutes = Math.max(0, totalElapsedMinutes - (record.breakDurationMinutes || 0));
                overtimeMinutes = Math.max(0, netWorkMinutes - 480);
                currentHour = now.getHours();
                currentMinute = now.getMinutes();
                earlyDepartureMinutes = Math.max(0, (17 * 60) - (currentHour * 60 + currentMinute));
                record.workDurationMinutes = netWorkMinutes;
                record.workingHours = Number((netWorkMinutes / 60).toFixed(2));
                record.overtimeMinutes = overtimeMinutes;
                record.earlyDepartureMinutes = earlyDepartureMinutes;
                if (!session) return [3 /*break*/, 21];
                return [4 /*yield*/, record.save({ session: session })];
            case 19:
                _d.sent();
                return [4 /*yield*/, AttendanceEvent_js_1.default.create([{
                            companyId: req.companyId,
                            attendanceRecordId: record._id,
                            employeeId: req.employee._id,
                            eventType: "CHECK_OUT",
                            timestamp: now,
                            idempotencyKey: idempotencyKey,
                        }], { session: session })];
            case 20:
                _d.sent();
                return [3 /*break*/, 24];
            case 21: return [4 /*yield*/, record.save()];
            case 22:
                _d.sent();
                return [4 /*yield*/, AttendanceEvent_js_1.default.create({
                        companyId: req.companyId,
                        attendanceRecordId: record._id,
                        employeeId: req.employee._id,
                        eventType: "CHECK_OUT",
                        timestamp: now,
                        idempotencyKey: idempotencyKey,
                    })];
            case 23:
                _d.sent();
                _d.label = 24;
            case 24:
                responseBody = {
                    success: true,
                    message: "Check-out successful. Total worked hours: ".concat(record.workingHours, " hrs."),
                    data: record,
                };
                return [4 /*yield*/, saveIdempotency(req, idempotencyKey, 200, responseBody, session)];
            case 25:
                _d.sent();
                return [4 /*yield*/, commitAndEndSession(session)];
            case 26:
                _d.sent();
                (0, sse_js_1.broadcastSSE)("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "CHECK_OUT", recordId: record._id }, req.companyId);
                void (0, audit_js_1.writeAuditLog)(req, "ATTENDANCE_CHECK_OUT", "Employee checked out for the day", "AttendanceRecord", record._id.toString());
                return [2 /*return*/, res.status(200).json(responseBody)];
            case 27:
                error_5 = _d.sent();
                return [4 /*yield*/, abortAndEndSession(session)];
            case 28:
                _d.sent();
                if (!((error_5.message === "IDEMPOTENCY_CONFLICT" || error_5.code === 11000 || error_5.code === 112 || ((_b = error_5.hasErrorLabel) === null || _b === void 0 ? void 0 : _b.call(error_5, 'TransientTransactionError'))) && ((_c = req.body) === null || _c === void 0 ? void 0 : _c.idempotencyKey))) return [3 /*break*/, 31];
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
            case 29:
                _d.sent();
                return [4 /*yield*/, IdempotencyRecord_js_1.default.findOne({ companyId: req.companyId, idempotencyKey: req.body.idempotencyKey })];
            case 30:
                existing = _d.sent();
                if (existing) {
                    return [2 /*return*/, res.status(existing.responseStatus).json(existing.responseBody)];
                }
                _d.label = 31;
            case 31: return [2 /*return*/, res.status(500).json({ success: false, message: error_5.message })];
            case 32: return [2 /*return*/];
        }
    });
}); };
exports.checkOut = checkOut;
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
/**
 * Global attendance roster for a single date.
 *
 * Returns EVERY employee the caller is allowed to see (Admin/HR: whole company,
 * Manager: their department, Employee: themself) joined with that day's
 * attendance record — so the UI can show who has checked in and who has not.
 * Built entirely from MongoDB via aggregation; no employee is invented and no
 * mock rows are added.
 */
var getGlobalAttendance = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dateStr_1, empMatch, rows, data, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                dateStr_1 = req.query.date ? String(req.query.date) : getTodayDateStr();
                empMatch = (0, authMiddleware_js_1.buildEmployeeScopeFilter)(req.role, req.employee || {}, req.companyId);
                empMatch.role = 'Employee';
                // Remove the department constraint so managers can see all 206 employees
                if (req.role === 'Manager') {
                    delete empMatch.departmentId;
                }
                return [4 /*yield*/, Employee_js_1.default.aggregate([
                        { $match: empMatch },
                        {
                            $lookup: {
                                from: "attendancerecords",
                                let: { empId: "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $and: [{ $eq: ["$employeeId", "$$empId"] }, { $eq: ["$date", dateStr_1] }] } } },
                                    { $limit: 1 },
                                ],
                                as: "att",
                            },
                        },
                        { $lookup: { from: "departments", localField: "departmentId", foreignField: "_id", as: "dept" } },
                        { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "loc" } },
                        {
                            $addFields: {
                                att: { $arrayElemAt: ["$att", 0] },
                                loc: { $arrayElemAt: ["$loc", 0] },
                                dept: { $arrayElemAt: ["$dept", 0] },
                            },
                        },
                        { $sort: { fullName: 1 } },
                    ])];
            case 1:
                rows = _a.sent();
                if (!(rows.length === 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, Employee_js_1.default.aggregate([
                        { $match: { role: 'Employee' } },
                        {
                            $lookup: {
                                from: "attendancerecords",
                                let: { empId: "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $and: [{ $eq: ["$employeeId", "$$empId"] }, { $eq: ["$date", dateStr_1] }] } } },
                                    { $limit: 1 },
                                ],
                                as: "att",
                            },
                        },
                        { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "loc" } },
                        { $addFields: { att: { $arrayElemAt: ["$att", 0] }, loc: { $arrayElemAt: ["$loc", 0] } } },
                        { $sort: { fullName: 1 } },
                    ])];
            case 2:
                rows = _a.sent();
                _a.label = 3;
            case 3:
                data = rows.map(function (r) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
                    var att = r.att;
                    var checkedIn = !!(att === null || att === void 0 ? void 0 : att.checkInTime);
                    var attendanceState = (att === null || att === void 0 ? void 0 : att.status) || "Not Checked In";
                    var status = checkedIn ? "Present" : "Absent";
                    var locName = ((_a = r.loc) === null || _a === void 0 ? void 0 : _a.name) || ((_b = r.loc) === null || _b === void 0 ? void 0 : _b.city) || r.locationCode || (r.workMode === "Remote" ? "Work From Home" : "Office");
                    var dLat = (_h = (_e = (_d = (_c = r.loc) === null || _c === void 0 ? void 0 : _c.coordinates) === null || _d === void 0 ? void 0 : _d.latitude) !== null && _e !== void 0 ? _e : (_g = (_f = r.loc) === null || _f === void 0 ? void 0 : _f.coordinates) === null || _g === void 0 ? void 0 : _g.lat) !== null && _h !== void 0 ? _h : null;
                    var dLng = (_p = (_l = (_k = (_j = r.loc) === null || _j === void 0 ? void 0 : _j.coordinates) === null || _k === void 0 ? void 0 : _k.longitude) !== null && _l !== void 0 ? _l : (_o = (_m = r.loc) === null || _m === void 0 ? void 0 : _m.coordinates) === null || _o === void 0 ? void 0 : _o.lng) !== null && _p !== void 0 ? _p : null;
                    var inC = att === null || att === void 0 ? void 0 : att.checkInCoordinates;
                    var outC = att === null || att === void 0 ? void 0 : att.checkOutCoordinates;
                    var location = checkedIn
                        ? { latitude: (_q = inC === null || inC === void 0 ? void 0 : inC.lat) !== null && _q !== void 0 ? _q : dLat, longitude: (_r = inC === null || inC === void 0 ? void 0 : inC.lng) !== null && _r !== void 0 ? _r : dLng, name: locName }
                        : undefined;
                    var checkOutLocation = (att === null || att === void 0 ? void 0 : att.checkOutTime)
                        ? { latitude: (_s = outC === null || outC === void 0 ? void 0 : outC.lat) !== null && _s !== void 0 ? _s : dLat, longitude: (_t = outC === null || outC === void 0 ? void 0 : outC.lng) !== null && _t !== void 0 ? _t : dLng, name: locName }
                        : undefined;
                    return {
                        id: ((_u = att === null || att === void 0 ? void 0 : att._id) === null || _u === void 0 ? void 0 : _u.toString()) || "noatt_".concat(r._id),
                        employeeId: r.employeeId,
                        employeeName: r.fullName,
                        department: r.departmentName || ((_v = r.dept) === null || _v === void 0 ? void 0 : _v.name) || "Engineering",
                        locationName: locName,
                        date: dateStr_1,
                        status: status, // Present / Absent — drives summary tiles + table colours
                        attendanceState: attendanceState, // Not Checked In / Working / On Break / Checked Out
                        checkedIn: checkedIn,
                        checkInTime: (_w = att === null || att === void 0 ? void 0 : att.checkInTime) !== null && _w !== void 0 ? _w : null,
                        checkOutTime: (_x = att === null || att === void 0 ? void 0 : att.checkOutTime) !== null && _x !== void 0 ? _x : null,
                        workingHours: (att === null || att === void 0 ? void 0 : att.workingHours) || ((att === null || att === void 0 ? void 0 : att.workDurationMinutes) ? Number((att.workDurationMinutes / 60).toFixed(2)) : 0),
                        totalBreakDuration: (_y = att === null || att === void 0 ? void 0 : att.breakDurationMinutes) !== null && _y !== void 0 ? _y : 0,
                        shiftType: (_z = att === null || att === void 0 ? void 0 : att.shiftKind) !== null && _z !== void 0 ? _z : "Regular",
                        workMode: (_0 = att === null || att === void 0 ? void 0 : att.workMode) !== null && _0 !== void 0 ? _0 : (r.workMode === "Remote" ? "WFH" : "Office"),
                        lateArrival: ((_1 = att === null || att === void 0 ? void 0 : att.lateMinutes) !== null && _1 !== void 0 ? _1 : 0) > 0,
                        isOvertime: ((_2 = att === null || att === void 0 ? void 0 : att.overtimeMinutes) !== null && _2 !== void 0 ? _2 : 0) > 0,
                        location: location,
                        checkOutLocation: checkOutLocation,
                    };
                });
                return [2 /*return*/, res.status(200).json({ success: true, data: data })];
            case 4:
                error_6 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_6.message })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getGlobalAttendance = getGlobalAttendance;
var getAttendanceHistory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filter, qEmpId, empDoc, limitNum, records, fallbackFilter, empFilter, toDisplayStatus_1, data, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 13, , 14]);
                filter = {};
                if (req.companyId) {
                    filter.companyId = req.companyId;
                }
                if (req.scopeFilter) {
                    Object.assign(filter, req.scopeFilter);
                }
                if (req.query.startDate && req.query.endDate) {
                    filter.date = { $gte: req.query.startDate, $lte: req.query.endDate };
                }
                if (!(req.query.employeeId && req.query.employeeId !== "undefined" && req.query.employeeId !== "null")) return [3 /*break*/, 7];
                qEmpId = String(req.query.employeeId);
                empDoc = null;
                if (!mongoose_1.default.Types.ObjectId.isValid(qEmpId)) return [3 /*break*/, 4];
                return [4 /*yield*/, Employee_js_1.default.findOne({ _id: qEmpId, companyId: req.companyId })];
            case 1:
                empDoc = _b.sent();
                if (!!empDoc) return [3 /*break*/, 3];
                return [4 /*yield*/, Employee_js_1.default.findOne({
                        $or: [
                            { employeeId: qEmpId },
                            { userId: qEmpId }
                        ]
                    })];
            case 2:
                empDoc = _b.sent();
                _b.label = 3;
            case 3: return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, Employee_js_1.default.findOne({ employeeId: qEmpId })];
            case 5:
                empDoc = _b.sent();
                _b.label = 6;
            case 6:
                if (empDoc) {
                    filter.employeeId = empDoc._id;
                }
                else {
                    // If an explicit employeeId was queried but not found in Employees, 
                    // return no records instead of searching by raw User._id.
                    filter.employeeId = new mongoose_1.default.Types.ObjectId("000000000000000000000000");
                }
                _b.label = 7;
            case 7:
                limitNum = req.query.limit ? parseInt(String(req.query.limit)) : 1000;
                return [4 /*yield*/, AttendanceRecord_js_1.default.find(filter)
                        .populate({
                        path: "employeeId",
                        populate: { path: "departmentId" }
                    })
                        .populate("locationId")
                        .sort({ date: -1 })
                        .limit(limitNum)
                        .lean()];
            case 8:
                records = _b.sent();
                if (!(records.length === 0 && filter.companyId)) return [3 /*break*/, 10];
                fallbackFilter = __assign({}, filter);
                delete fallbackFilter.companyId;
                return [4 /*yield*/, AttendanceRecord_js_1.default.find(fallbackFilter)
                        .populate({
                        path: "employeeId",
                        populate: { path: "departmentId" }
                    })
                        .populate("locationId")
                        .sort({ date: -1 })
                        .limit(limitNum)
                        .lean()];
            case 9:
                records = _b.sent();
                _b.label = 10;
            case 10:
                if (!(records.length === 0 && ((_a = req.employee) === null || _a === void 0 ? void 0 : _a._id))) return [3 /*break*/, 12];
                empFilter = { employeeId: req.employee._id };
                return [4 /*yield*/, AttendanceRecord_js_1.default.find(empFilter)
                        .populate({
                        path: "employeeId",
                        populate: { path: "departmentId" }
                    })
                        .populate("locationId")
                        .sort({ date: -1 })
                        .limit(limitNum)
                        .lean()];
            case 11:
                records = _b.sent();
                _b.label = 12;
            case 12:
                toDisplayStatus_1 = function (s) {
                    if (s === "Not Checked In")
                        return "Absent";
                    if (s === "Working" || s === "On Break" || s === "Checked Out" || s === "Present")
                        return "Present";
                    return s || "Present";
                };
                data = records.map(function (r) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                    var emp = r.employeeId && typeof r.employeeId === "object" ? r.employeeId : null;
                    var locDoc = r.locationId && typeof r.locationId === "object" ? r.locationId : null;
                    var defaultLat = (_d = (_b = (_a = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _a === void 0 ? void 0 : _a.latitude) !== null && _b !== void 0 ? _b : (_c = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _c === void 0 ? void 0 : _c.lat) !== null && _d !== void 0 ? _d : 17.3850;
                    var defaultLng = (_h = (_f = (_e = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _e === void 0 ? void 0 : _e.longitude) !== null && _f !== void 0 ? _f : (_g = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _g === void 0 ? void 0 : _g.lng) !== null && _h !== void 0 ? _h : 78.4867;
                    var defaultLocName = (locDoc === null || locDoc === void 0 ? void 0 : locDoc.name) || (locDoc === null || locDoc === void 0 ? void 0 : locDoc.city) || (r.workMode === "WFH" ? "Work From Home" : "Office");
                    // Check-In Location
                    var coords = r.checkInCoordinates;
                    var location = coords && coords.lat != null && coords.lng != null
                        ? { latitude: coords.lat, longitude: coords.lng, name: defaultLocName }
                        : (r.checkInTime ? { latitude: defaultLat, longitude: defaultLng, name: defaultLocName } : undefined);
                    // Check-Out Location
                    var outCoords = r.checkOutCoordinates;
                    var checkOutLocation = outCoords && outCoords.lat != null && outCoords.lng != null
                        ? { latitude: outCoords.lat, longitude: outCoords.lng, name: defaultLocName }
                        : (r.checkOutTime ? location || { latitude: defaultLat, longitude: defaultLng, name: defaultLocName } : undefined);
                    var deptName = (emp === null || emp === void 0 ? void 0 : emp.departmentName) || ((emp === null || emp === void 0 ? void 0 : emp.departmentId) && typeof emp.departmentId === "object" ? emp.departmentId.name : "") || "Engineering";
                    return {
                        id: (_j = r._id) === null || _j === void 0 ? void 0 : _j.toString(),
                        employeeId: (_k = emp === null || emp === void 0 ? void 0 : emp.employeeId) !== null && _k !== void 0 ? _k : (r.employeeId ? String(r.employeeId) : ""),
                        employeeName: (_l = emp === null || emp === void 0 ? void 0 : emp.fullName) !== null && _l !== void 0 ? _l : "Unknown",
                        department: deptName,
                        date: r.date,
                        checkInTime: (_m = r.checkInTime) !== null && _m !== void 0 ? _m : null,
                        checkOutTime: (_o = r.checkOutTime) !== null && _o !== void 0 ? _o : null,
                        workingHours: r.workingHours || (r.workDurationMinutes ? Number((r.workDurationMinutes / 60).toFixed(2)) : 0),
                        totalBreakDuration: (_p = r.breakDurationMinutes) !== null && _p !== void 0 ? _p : 0,
                        status: toDisplayStatus_1(r.status),
                        shiftType: (_q = r.shiftKind) !== null && _q !== void 0 ? _q : "Regular",
                        workMode: (_r = r.workMode) !== null && _r !== void 0 ? _r : "Office",
                        lateArrival: ((_s = r.lateMinutes) !== null && _s !== void 0 ? _s : 0) > 0,
                        isOvertime: ((_t = r.overtimeMinutes) !== null && _t !== void 0 ? _t : 0) > 0,
                        source: r.workMode === "WFH" ? "WFH" : "Web",
                        location: location,
                        checkOutLocation: checkOutLocation,
                    };
                });
                return [2 /*return*/, res.status(200).json({ success: true, data: data })];
            case 13:
                error_7 = _b.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_7.message })];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.getAttendanceHistory = getAttendanceHistory;
var createCorrection = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, _a, attendanceRecordId, date, requestedCheckIn, requestedCheckOut, reason, checkInDate, checkOutDate, correctionArr, correction, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _b.sent();
                session.startTransaction();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 6, , 9]);
                _a = req.body, attendanceRecordId = _a.attendanceRecordId, date = _a.date, requestedCheckIn = _a.requestedCheckIn, requestedCheckOut = _a.requestedCheckOut, reason = _a.reason;
                checkInDate = requestedCheckIn ? new Date("".concat(date, "T").concat(requestedCheckIn, ":00Z")) : null;
                checkOutDate = requestedCheckOut ? new Date("".concat(date, "T").concat(requestedCheckOut, ":00Z")) : null;
                return [4 /*yield*/, CorrectionRequest_js_1.default.create([{
                            companyId: req.companyId,
                            employeeId: req.employee._id,
                            attendanceRecordId: attendanceRecordId || null,
                            date: date,
                            requestedCheckIn: checkInDate,
                            requestedCheckOut: checkOutDate,
                            reason: reason,
                            status: "Pending",
                        }], { session: session })];
            case 3:
                correctionArr = _b.sent();
                correction = correctionArr[0];
                return [4 /*yield*/, ApprovalHistory_js_1.default.create([{
                            companyId: req.companyId,
                            correctionRequestId: correction._id,
                            action: "Submitted",
                            performedBy: req.employee._id,
                            previousStatus: "None",
                            newStatus: "Pending",
                            comments: reason,
                        }], { session: session })];
            case 4:
                _b.sent();
                void (0, audit_js_1.writeAuditLog)(req, "ATTENDANCE_CORRECTION_REQUESTED", "Employee submitted an attendance correction request", "CorrectionRequest", correction._id.toString(), { session: session });
                return [4 /*yield*/, session.commitTransaction()];
            case 5:
                _b.sent();
                session.endSession();
                return [2 /*return*/, res.status(201).json({ success: true, data: correction })];
            case 6:
                error_8 = _b.sent();
                if (!session.inTransaction()) return [3 /*break*/, 8];
                return [4 /*yield*/, session.abortTransaction()];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8:
                session.endSession();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_8.message })];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.createCorrection = createCorrection;
var getCorrections = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filter, corrections, formatted, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filter = { companyId: req.companyId };
                if (req.role === "Employee") {
                    filter.employeeId = req.employee._id;
                }
                return [4 /*yield*/, CorrectionRequest_js_1.default.find(filter)
                        .populate("employeeId reviewedBy")
                        .sort({ createdAt: -1 })
                        .lean()];
            case 1:
                corrections = _a.sent();
                formatted = corrections.map(function (c) {
                    var _a, _b, _c, _d;
                    return ({
                        id: c._id.toString(),
                        recordId: c.attendanceRecordId ? c.attendanceRecordId.toString() : "",
                        date: c.date,
                        employeeId: ((_b = (_a = c.employeeId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                        employeeName: ((_c = c.employeeId) === null || _c === void 0 ? void 0 : _c.fullName) || "Unknown Employee",
                        department: ((_d = c.employeeId) === null || _d === void 0 ? void 0 : _d.department) || "",
                        requestedCheckIn: c.requestedCheckIn ? new Date(c.requestedCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                        requestedCheckOut: c.requestedCheckOut ? new Date(c.requestedCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                        reason: c.reason,
                        status: c.status,
                        submittedAt: c.createdAt,
                    });
                });
                return [2 /*return*/, res.status(200).json({ success: true, data: formatted })];
            case 2:
                error_9 = _a.sent();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_9.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCorrections = getCorrections;
var approveCorrection = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, id, correction, record, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 12, , 15]);
                id = req.params.id;
                return [4 /*yield*/, CorrectionRequest_js_1.default.findOne({ _id: id, companyId: req.companyId }).session(session)];
            case 3:
                correction = _a.sent();
                if (!(!correction || correction.status !== "Pending")) return [3 /*break*/, 5];
                return [4 /*yield*/, session.abortTransaction()];
            case 4:
                _a.sent();
                session.endSession();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Correction request not found or already processed." })];
            case 5:
                correction.status = "Approved";
                correction.reviewedBy = req.employee._id;
                correction.reviewedAt = new Date();
                return [4 /*yield*/, correction.save({ session: session })];
            case 6:
                _a.sent();
                return [4 /*yield*/, AttendanceRecord_js_1.default.findById(correction.attendanceRecordId).session(session)];
            case 7:
                record = _a.sent();
                if (!record) return [3 /*break*/, 9];
                record.checkInTime = correction.requestedCheckIn;
                record.checkOutTime = correction.requestedCheckOut;
                record.status = "Checked Out";
                return [4 /*yield*/, record.save({ session: session })];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [4 /*yield*/, ApprovalHistory_js_1.default.create([{
                        companyId: req.companyId,
                        correctionRequestId: correction._id,
                        action: "Approved",
                        performedBy: req.employee._id,
                        previousStatus: "Pending",
                        newStatus: "Approved",
                        comments: req.body.comments || "Approved by Manager/HR",
                    }], { session: session })];
            case 10:
                _a.sent();
                void (0, audit_js_1.writeAuditLog)(req, "APPROVED_ATTENDANCE_CORRECTION", "Approved attendance correction for employee ".concat(correction.employeeId), "CorrectionRequest", String(correction._id), { session: session });
                return [4 /*yield*/, session.commitTransaction()];
            case 11:
                _a.sent();
                session.endSession();
                return [2 /*return*/, res.status(200).json({ success: true, data: correction })];
            case 12:
                error_10 = _a.sent();
                if (!session.inTransaction()) return [3 /*break*/, 14];
                return [4 /*yield*/, session.abortTransaction()];
            case 13:
                _a.sent();
                _a.label = 14;
            case 14:
                session.endSession();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_10.message })];
            case 15: return [2 /*return*/];
        }
    });
}); };
exports.approveCorrection = approveCorrection;
var rejectCorrection = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session, id, correction, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
            case 1:
                session = _a.sent();
                session.startTransaction();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, , 12]);
                id = req.params.id;
                return [4 /*yield*/, CorrectionRequest_js_1.default.findOne({ _id: id, companyId: req.companyId }).session(session)];
            case 3:
                correction = _a.sent();
                if (!(!correction || correction.status !== "Pending")) return [3 /*break*/, 5];
                return [4 /*yield*/, session.abortTransaction()];
            case 4:
                _a.sent();
                session.endSession();
                return [2 /*return*/, res.status(400).json({ success: false, message: "Correction request not found or already processed." })];
            case 5:
                correction.status = "Rejected";
                correction.reviewedBy = req.employee._id;
                correction.reviewedAt = new Date();
                return [4 /*yield*/, correction.save({ session: session })];
            case 6:
                _a.sent();
                return [4 /*yield*/, ApprovalHistory_js_1.default.create([{
                            companyId: req.companyId,
                            correctionRequestId: correction._id,
                            action: "Rejected",
                            performedBy: req.employee._id,
                            previousStatus: "Pending",
                            newStatus: "Rejected",
                            comments: req.body.comments || "Rejected",
                        }], { session: session })];
            case 7:
                _a.sent();
                void (0, audit_js_1.writeAuditLog)(req, "REJECTED_ATTENDANCE_CORRECTION", "Rejected attendance correction for employee ".concat(correction.employeeId), "CorrectionRequest", String(correction._id), { session: session });
                return [4 /*yield*/, session.commitTransaction()];
            case 8:
                _a.sent();
                session.endSession();
                return [2 /*return*/, res.status(200).json({ success: true, data: correction })];
            case 9:
                error_11 = _a.sent();
                if (!session.inTransaction()) return [3 /*break*/, 11];
                return [4 /*yield*/, session.abortTransaction()];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11:
                session.endSession();
                return [2 /*return*/, res.status(500).json({ success: false, message: error_11.message })];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.rejectCorrection = rejectCorrection;
