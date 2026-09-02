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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
var dotenv_1 = __importDefault(require("dotenv"));
var db_js_1 = __importStar(require("../config/db.js"));
var mongoose_1 = __importDefault(require("mongoose"));
var Company_js_1 = __importDefault(require("../models/Company.js"));
var Location_js_1 = __importDefault(require("../models/Location.js"));
var Department_js_1 = __importDefault(require("../models/Department.js"));
var Team_js_1 = __importDefault(require("../models/Team.js"));
var User_js_1 = require("../models/User.js");
var Employee_js_1 = __importDefault(require("../models/Employee.js"));
var Shift_js_1 = __importDefault(require("../models/Shift.js"));
var ShiftAssignment_js_1 = __importDefault(require("../models/ShiftAssignment.js"));
var AttendanceRecord_js_1 = __importDefault(require("../models/AttendanceRecord.js"));
var AttendanceEvent_js_1 = __importDefault(require("../models/AttendanceEvent.js"));
var BreakSession_js_1 = __importDefault(require("../models/BreakSession.js"));
var CorrectionRequest_js_1 = __importDefault(require("../models/CorrectionRequest.js"));
var ApprovalHistory_js_1 = __importDefault(require("../models/ApprovalHistory.js"));
var PerformanceRecord_js_1 = __importDefault(require("../models/PerformanceRecord.js"));
var ProductivityRecord_js_1 = __importDefault(require("../models/ProductivityRecord.js"));
var Skill_js_1 = __importDefault(require("../models/Skill.js"));
var EmployeeSkill_js_1 = __importDefault(require("../models/EmployeeSkill.js"));
var Task_js_1 = __importDefault(require("../models/Task.js"));
var LeaveRequest_js_1 = __importDefault(require("../models/LeaveRequest.js"));
var Notification_js_1 = __importDefault(require("../models/Notification.js"));
var AuditLog_js_1 = __importDefault(require("../models/AuditLog.js"));
var IdempotencyRecord_js_1 = __importDefault(require("../models/IdempotencyRecord.js"));
dotenv_1.default.config();
// Simple PRNG for deterministic seeding
var PseudoRandom = /** @class */ (function () {
    function PseudoRandom(seed) {
        if (seed === void 0) { seed = 42; }
        this.seed = seed;
    }
    PseudoRandom.prototype.next = function () {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    };
    PseudoRandom.prototype.range = function (min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    };
    PseudoRandom.prototype.choice = function (array) {
        return array[this.range(0, array.length - 1)];
    };
    return PseudoRandom;
}());
var prng = new PseudoRandom(12345);
var FIRST_NAMES = [
    "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Rahul", "Sneha", "Kiran", "Meera",
    "Siddharth", "Kavya", "Aditya", "Riya", "Arjun", "Pooja", "Varun", "Ishita", "Suresh", "Divya",
    "Rajesh", "Swati", "Manish", "Deepika", "Amit", "Tanvi", "Sunil", "Bhavna", "Vijay", "Anusha"
];
var LAST_NAMES = [
    "Sharma", "Verma", "Reddy", "Rao", "Nair", "Patel", "Gupta", "Kumar", "Singh", "Joshi",
    "Iyer", "Chowdhury", "Deshmukh", "Kulkarni", "Menon", "Pillai", "Das", "Banerjee", "Bhat", "Mehta"
];
var LOCATION_DEFS = [
    { code: "HYD", name: "Hyderabad", count: 70, lat: 17.3850, lng: 78.4867, city: "Hyderabad", address: "HITEC City, Phase 2, Hyderabad, Telangana" },
    { code: "VSP", name: "Visakhapatnam", count: 40, lat: 17.6868, lng: 83.2185, city: "Visakhapatnam", address: "IT SEZ, Rushikonda, Visakhapatnam, Andhra Pradesh" },
    { code: "CHN", name: "Chennai", count: 50, lat: 13.0827, lng: 80.2707, city: "Chennai", address: "OMR IT Corridor, Taramani, Chennai, Tamil Nadu" },
    { code: "BLR", name: "Bengaluru", count: 60, lat: 12.9716, lng: 77.5946, city: "Bengaluru", address: "Electronic City, Phase 1, Bengaluru, Karnataka" },
    { code: "KOC", name: "Kochi", count: 30, lat: 9.9312, lng: 76.2673, city: "Kochi", address: "Infopark, Kakkanad, Kochi, Kerala" },
];
var DEPARTMENTS_DEF = [
    { code: "ENG", name: "Engineering" },
    { code: "HR", name: "Human Resources" },
    { code: "FIN", name: "Finance" },
    { code: "SALES", name: "Sales" },
    { code: "MKT", name: "Marketing" },
    { code: "OPS", name: "Operations" },
    { code: "CS", name: "Customer Support" },
];
function runSeed() {
    return __awaiter(this, arguments, void 0, function (reset) {
        var existingCompany, company, regularShift, nightShift, flexShift, locationDocs, _i, LOCATION_DEFS_1, locDef, loc, deptDocs, teamDocs, _a, LOCATION_DEFS_2, locDef, loc, _b, DEPARTMENTS_DEF_1, deptDef, dept, t, team, SKILL_DEFS, skillDocs, _c, SKILL_DEFS_1, sDef, skill, defaultPasswordStr, devAccountPasswords, devAccountsConfig, createdEmployees, globalEmpIndex, _loop_1, _d, LOCATION_DEFS_3, locDef, managerEmployees, _loop_2, _e, createdEmployees_1, emp, empSkillsToInsert, _f, createdEmployees_2, emp, s1, s2, _g, _h, s, attendanceRecordsBatch, performanceRecordsBatch, productivityRecordsBatch, tasksBatch, now, _j, createdEmployees_3, emp, q, dayOffset, dateObj, dateStr, _loop_3, _k, createdEmployees_4, emp, chunk, chunk, t, emp;
        var _l, _m, _o, _p, _q, _r, _s;
        if (reset === void 0) { reset = false; }
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    console.log("[Seed Engine] Starting deterministic seeding (Reset=".concat(reset, ")..."));
                    if (!(mongoose_1.default.connection.readyState !== 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, db_js_1.default)()];
                case 1:
                    _t.sent();
                    _t.label = 2;
                case 2:
                    if (!reset) return [3 /*break*/, 5];
                    if (process.env.NODE_ENV === "production") {
                        console.error("[Seed Engine] ERROR: Cannot reset database in production environment!");
                        process.exit(1);
                    }
                    console.log("[Seed Engine] Reset flag detected. Clearing collections...");
                    return [4 /*yield*/, Promise.all([
                            Company_js_1.default.deleteMany({}),
                            Location_js_1.default.deleteMany({}),
                            Department_js_1.default.deleteMany({}),
                            Team_js_1.default.deleteMany({}),
                            User_js_1.User.deleteMany({}),
                            Employee_js_1.default.deleteMany({}),
                            User_js_1.AdminAuth.deleteMany({}),
                            User_js_1.HRAuth.deleteMany({}),
                            User_js_1.ManagerAuth.deleteMany({}),
                            User_js_1.EmployeeAuth.deleteMany({}),
                            Shift_js_1.default.deleteMany({}),
                            ShiftAssignment_js_1.default.deleteMany({}),
                            AttendanceRecord_js_1.default.deleteMany({}),
                            AttendanceEvent_js_1.default.deleteMany({}),
                            BreakSession_js_1.default.deleteMany({}),
                            CorrectionRequest_js_1.default.deleteMany({}),
                            ApprovalHistory_js_1.default.deleteMany({}),
                            PerformanceRecord_js_1.default.deleteMany({}),
                            ProductivityRecord_js_1.default.deleteMany({}),
                            Skill_js_1.default.deleteMany({}),
                            EmployeeSkill_js_1.default.deleteMany({}),
                            Task_js_1.default.deleteMany({}),
                            LeaveRequest_js_1.default.deleteMany({}),
                            Notification_js_1.default.deleteMany({}),
                            AuditLog_js_1.default.deleteMany({}),
                            IdempotencyRecord_js_1.default.deleteMany({}),
                        ])];
                case 3:
                    _t.sent();
                    return [4 /*yield*/, PerformanceRecord_js_1.default.collection.dropIndexes().catch(function () { })];
                case 4:
                    _t.sent();
                    _t.label = 5;
                case 5: return [4 /*yield*/, Company_js_1.default.findOne({ code: "STACKLY" })];
                case 6:
                    existingCompany = _t.sent();
                    if (!(existingCompany && !reset)) return [3 /*break*/, 10];
                    console.log("[Seed Engine] Database already populated. Use --reset to re-seed.");
                    return [4 /*yield*/, printCollectionCounts()];
                case 7:
                    _t.sent();
                    if (!(((_l = process.argv[1]) === null || _l === void 0 ? void 0 : _l.includes('seed.ts')) || ((_m = process.argv[1]) === null || _m === void 0 ? void 0 : _m.includes('seedRoles.ts')))) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, db_js_1.closeDB)()];
                case 8:
                    _t.sent();
                    _t.label = 9;
                case 9: return [2 /*return*/];
                case 10: return [4 /*yield*/, Company_js_1.default.create({
                        name: "Stackly",
                        code: "STACKLY",
                        domain: "stackly.com",
                        settings: { defaultGeofenceRadiusMeters: 500, timezone: "Asia/Kolkata" },
                    })];
                case 11:
                    company = _t.sent();
                    return [4 /*yield*/, Shift_js_1.default.create({
                            companyId: company._id,
                            name: "Regular General Shift",
                            code: "REG-01",
                            type: "Regular",
                            startTime: "09:00",
                            endTime: "18:00",
                            breakDurationMinutes: 60,
                        })];
                case 12:
                    regularShift = _t.sent();
                    return [4 /*yield*/, Shift_js_1.default.create({
                            companyId: company._id,
                            name: "US Night Shift",
                            code: "NIGHT-01",
                            type: "Night",
                            startTime: "21:00",
                            endTime: "06:00",
                            breakDurationMinutes: 60,
                        })];
                case 13:
                    nightShift = _t.sent();
                    return [4 /*yield*/, Shift_js_1.default.create({
                            companyId: company._id,
                            name: "Flexible Core Shift",
                            code: "FLEX-01",
                            type: "Flexible",
                            startTime: "10:00",
                            endTime: "19:00",
                            breakDurationMinutes: 60,
                        })];
                case 14:
                    flexShift = _t.sent();
                    locationDocs = {};
                    _i = 0, LOCATION_DEFS_1 = LOCATION_DEFS;
                    _t.label = 15;
                case 15:
                    if (!(_i < LOCATION_DEFS_1.length)) return [3 /*break*/, 18];
                    locDef = LOCATION_DEFS_1[_i];
                    return [4 /*yield*/, Location_js_1.default.create({
                            companyId: company._id,
                            code: locDef.code,
                            name: locDef.name,
                            city: locDef.city,
                            address: locDef.address,
                            coordinates: { latitude: locDef.lat, longitude: locDef.lng },
                            radiusMeters: 500,
                            targetEmployeeCount: locDef.count,
                        })];
                case 16:
                    loc = _t.sent();
                    locationDocs[locDef.code] = loc;
                    _t.label = 17;
                case 17:
                    _i++;
                    return [3 /*break*/, 15];
                case 18:
                    deptDocs = [];
                    teamDocs = [];
                    _a = 0, LOCATION_DEFS_2 = LOCATION_DEFS;
                    _t.label = 19;
                case 19:
                    if (!(_a < LOCATION_DEFS_2.length)) return [3 /*break*/, 27];
                    locDef = LOCATION_DEFS_2[_a];
                    loc = locationDocs[locDef.code];
                    _b = 0, DEPARTMENTS_DEF_1 = DEPARTMENTS_DEF;
                    _t.label = 20;
                case 20:
                    if (!(_b < DEPARTMENTS_DEF_1.length)) return [3 /*break*/, 26];
                    deptDef = DEPARTMENTS_DEF_1[_b];
                    return [4 /*yield*/, Department_js_1.default.create({
                            companyId: company._id,
                            locationId: loc._id,
                            name: "".concat(deptDef.name, " - ").concat(locDef.code),
                            code: "".concat(deptDef.code, "-").concat(locDef.code),
                        })];
                case 21:
                    dept = _t.sent();
                    deptDocs.push(dept);
                    t = 1;
                    _t.label = 22;
                case 22:
                    if (!(t <= 2)) return [3 /*break*/, 25];
                    return [4 /*yield*/, Team_js_1.default.create({
                            companyId: company._id,
                            department: dept._id,
                            name: "".concat(deptDef.name, " Team ").concat(t, " (").concat(locDef.code, ")"),
                        })];
                case 23:
                    team = _t.sent();
                    teamDocs.push(team);
                    _t.label = 24;
                case 24:
                    t++;
                    return [3 /*break*/, 22];
                case 25:
                    _b++;
                    return [3 /*break*/, 20];
                case 26:
                    _a++;
                    return [3 /*break*/, 19];
                case 27:
                    SKILL_DEFS = [
                        { name: "React.js", category: "Frontend" },
                        { name: "TypeScript", category: "Frontend" },
                        { name: "Node.js", category: "Backend" },
                        { name: "MongoDB", category: "Database" },
                        { name: "Python", category: "Backend" },
                        { name: "Recruitment", category: "HR" },
                        { name: "Payroll Management", category: "Finance" },
                        { name: "Client Relations", category: "Sales" },
                        { name: "Agile Leadership", category: "Management" },
                    ];
                    skillDocs = [];
                    _c = 0, SKILL_DEFS_1 = SKILL_DEFS;
                    _t.label = 28;
                case 28:
                    if (!(_c < SKILL_DEFS_1.length)) return [3 /*break*/, 31];
                    sDef = SKILL_DEFS_1[_c];
                    return [4 /*yield*/, Skill_js_1.default.create({
                            companyId: company._id,
                            name: sDef.name,
                            category: sDef.category,
                        })];
                case 29:
                    skill = _t.sent();
                    skillDocs.push(skill);
                    _t.label = 30;
                case 30:
                    _c++;
                    return [3 /*break*/, 28];
                case 31:
                    defaultPasswordStr = "Password123!";
                    devAccountPasswords = {
                        Admin: "Password123!",
                        HR: "Password123!",
                        Manager: "Password123!",
                        Employee: "Password123!",
                    };
                    devAccountsConfig = [
                        { role: "Admin", email: "admin@thestackly.com", empId: "EMP-001", firstName: "System", lastName: "Admin", locCode: "HYD", deptIndex: 0 },
                        { role: "HR", email: "hr@thestackly.com", empId: "EMP-002", firstName: "David", lastName: "Miller", locCode: "HYD", deptIndex: 1 },
                        { role: "Manager", email: "manager@thestackly.com", empId: "EMP-003", firstName: "Robert", lastName: "King", locCode: "HYD", deptIndex: 0 },
                        { role: "Employee", email: "employee@thestackly.com", empId: "EMP-004", firstName: "Pavan", lastName: "Reddy", locCode: "HYD", deptIndex: 0 },
                    ];
                    createdEmployees = [];
                    globalEmpIndex = 1;
                    _loop_1 = function (locDef) {
                        var loc, locDepts, _loop_4, i;
                        return __generator(this, function (_u) {
                            switch (_u.label) {
                                case 0:
                                    loc = locationDocs[locDef.code];
                                    locDepts = deptDocs.filter(function (d) { return d.code.endsWith("-".concat(locDef.code)); });
                                    _loop_4 = function (i) {
                                        var empIdNumber, empIdStr, devCfg, role, email, firstName, lastName, passStr, roleAuthModel, AuthModel, user, assignedDept, assignedTeams, assignedTeam, workMode, shift, riskLevel, emp;
                                        return __generator(this, function (_v) {
                                            switch (_v.label) {
                                                case 0:
                                                    empIdNumber = globalEmpIndex;
                                                    empIdStr = "EMP-".concat(String(empIdNumber).padStart(3, "0"));
                                                    devCfg = devAccountsConfig.find(function (d) { return d.empId === empIdStr; });
                                                    role = "Employee";
                                                    email = "employee".concat(empIdNumber, "@thestackly.com");
                                                    firstName = prng.choice(FIRST_NAMES);
                                                    lastName = prng.choice(LAST_NAMES);
                                                    if (devCfg) {
                                                        role = devCfg.role;
                                                        email = devCfg.email;
                                                        firstName = devCfg.firstName;
                                                        lastName = devCfg.lastName;
                                                    }
                                                    else if (empIdNumber === 5) {
                                                        role = "Manager"; // 1 additional Manager
                                                    }
                                                    else if (empIdNumber > 5 && empIdNumber <= 14) {
                                                        role = "HR"; // 9 additional HRs
                                                    }
                                                    passStr = devAccountsConfig.some(function (d) { return d.email === email; })
                                                        ? devAccountPasswords[role]
                                                        : defaultPasswordStr;
                                                    roleAuthModel = {
                                                        Admin: User_js_1.AdminAuth,
                                                        HR: User_js_1.HRAuth,
                                                        Manager: User_js_1.ManagerAuth,
                                                        Employee: User_js_1.EmployeeAuth,
                                                    };
                                                    AuthModel = roleAuthModel[role] || User_js_1.EmployeeAuth;
                                                    return [4 /*yield*/, AuthModel.create({
                                                            companyId: company._id,
                                                            employeeId: empIdStr,
                                                            email: email.toLowerCase(),
                                                            password: passStr,
                                                            role: role,
                                                            isActive: true,
                                                        })];
                                                case 1:
                                                    user = _v.sent();
                                                    assignedDept = locDepts[i % locDepts.length];
                                                    assignedTeams = teamDocs.filter(function (t) { return t.department.toString() === assignedDept._id.toString(); });
                                                    assignedTeam = assignedTeams[i % assignedTeams.length];
                                                    workMode = prng.choice(["Office", "Office", "Office", "Hybrid", "Remote"]);
                                                    shift = prng.choice([regularShift, flexShift, nightShift]);
                                                    riskLevel = prng.choice(["Low", "Low", "Low", "Medium", "High"]);
                                                    return [4 /*yield*/, Employee_js_1.default.create({
                                                            companyId: company._id,
                                                            userId: user._id,
                                                            employeeId: empIdStr,
                                                            email: email.toLowerCase(),
                                                            firstName: firstName,
                                                            lastName: lastName,
                                                            fullName: "".concat(firstName, " ").concat(lastName),
                                                            locationId: loc._id,
                                                            locationCode: loc.code,
                                                            departmentId: assignedDept._id,
                                                            departmentName: assignedDept.name,
                                                            teamId: assignedTeam._id,
                                                            managerId: null, // Will update next
                                                            role: role,
                                                            designation: "".concat(role === 'Employee' ? 'Software Engineer' : role),
                                                            workMode: workMode,
                                                            shiftId: shift._id,
                                                            joiningDate: new Date(Date.now() - prng.range(30, 365) * 24 * 60 * 60 * 1000),
                                                            employmentStatus: "Active",
                                                            riskLevel: riskLevel,
                                                            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=".concat(empIdStr),
                                                        })];
                                                case 2:
                                                    emp = _v.sent();
                                                    createdEmployees.push(emp);
                                                    globalEmpIndex++;
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    i = 0;
                                    _u.label = 1;
                                case 1:
                                    if (!(i < locDef.count)) return [3 /*break*/, 4];
                                    return [5 /*yield**/, _loop_4(i)];
                                case 2:
                                    _u.sent();
                                    _u.label = 3;
                                case 3:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _d = 0, LOCATION_DEFS_3 = LOCATION_DEFS;
                    _t.label = 32;
                case 32:
                    if (!(_d < LOCATION_DEFS_3.length)) return [3 /*break*/, 35];
                    locDef = LOCATION_DEFS_3[_d];
                    return [5 /*yield**/, _loop_1(locDef)];
                case 33:
                    _t.sent();
                    _t.label = 34;
                case 34:
                    _d++;
                    return [3 /*break*/, 32];
                case 35:
                    managerEmployees = createdEmployees.filter(function (e) { return e.role === "Manager" || e.role === "Admin"; });
                    _loop_2 = function (emp) {
                        var mgr;
                        return __generator(this, function (_w) {
                            switch (_w.label) {
                                case 0:
                                    if (!(emp.role !== "Admin" && managerEmployees.length > 0)) return [3 /*break*/, 2];
                                    mgr = managerEmployees.find(function (m) { return m.departmentId.toString() === emp.departmentId.toString(); }) || managerEmployees[0];
                                    return [4 /*yield*/, Employee_js_1.default.updateOne({ _id: emp._id }, { managerId: mgr._id })];
                                case 1:
                                    _w.sent();
                                    emp.managerId = mgr._id;
                                    _w.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _e = 0, createdEmployees_1 = createdEmployees;
                    _t.label = 36;
                case 36:
                    if (!(_e < createdEmployees_1.length)) return [3 /*break*/, 39];
                    emp = createdEmployees_1[_e];
                    return [5 /*yield**/, _loop_2(emp)];
                case 37:
                    _t.sent();
                    _t.label = 38;
                case 38:
                    _e++;
                    return [3 /*break*/, 36];
                case 39:
                    console.log("[Seed Engine] Created 250 Employees across 5 locations.");
                    empSkillsToInsert = [];
                    for (_f = 0, createdEmployees_2 = createdEmployees; _f < createdEmployees_2.length; _f++) {
                        emp = createdEmployees_2[_f];
                        s1 = prng.choice(skillDocs);
                        s2 = prng.choice(skillDocs);
                        while (s2._id.toString() === s1._id.toString()) {
                            s2 = prng.choice(skillDocs);
                        }
                        for (_g = 0, _h = [s1, s2]; _g < _h.length; _g++) {
                            s = _h[_g];
                            empSkillsToInsert.push({
                                companyId: company._id,
                                employeeId: emp._id,
                                skillId: s._id,
                                proficiencyLevel: prng.range(2, 5),
                            });
                        }
                    }
                    return [4 /*yield*/, EmployeeSkill_js_1.default.insertMany(empSkillsToInsert, { ordered: false })];
                case 40:
                    _t.sent();
                    // 8. Seed 12 Months Historical Data (Attendance, Performance, Productivity, Tasks)
                    console.log("[Seed Engine] Generating 12 months historical attendance, performance & productivity records...");
                    attendanceRecordsBatch = [];
                    performanceRecordsBatch = [];
                    productivityRecordsBatch = [];
                    tasksBatch = [];
                    now = new Date();
                    // Seed performance records for 4 quarters
                    for (_j = 0, createdEmployees_3 = createdEmployees; _j < createdEmployees_3.length; _j++) {
                        emp = createdEmployees_3[_j];
                        for (q = 1; q <= 4; q++) {
                            performanceRecordsBatch.push({
                                companyId: company._id,
                                employeeId: emp._id,
                                period: "2025-Q".concat(q),
                                month: "2025-Q".concat(q),
                                rating: prng.range(3, 5),
                                goalsCompleted: prng.range(4, 10),
                                goalsAssigned: 10,
                                feedback: "Consistent performer with great teamwork.",
                                reviewerId: emp.managerId || emp._id,
                            });
                        }
                    }
                    return [4 /*yield*/, PerformanceRecord_js_1.default.insertMany(performanceRecordsBatch, { ordered: false })];
                case 41:
                    _t.sent();
                    // Seed 30 days of recent HISTORICAL attendance & productivity for all 250
                    // employees in batches. We start at dayOffset = 1 (yesterday) and never write
                    // the current day: today must begin as "Not Checked In" so employees can
                    // actually check in / out through the app each day. Writing today here would
                    // leave every employee already "Checked Out" and block real check-ins.
                    for (dayOffset = 1; dayOffset <= 30; dayOffset++) {
                        dateObj = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
                        if (dateObj.getDay() === 0 || dateObj.getDay() === 6)
                            continue; // Skip weekends
                        dateStr = dateObj.toISOString().split("T")[0];
                        _loop_3 = function (emp) {
                            var isAbsent = prng.range(1, 100) > 92;
                            var status_1 = isAbsent ? "Not Checked In" : "Checked Out";
                            var checkInHour = prng.range(8, 10);
                            var checkInMin = prng.range(0, 59);
                            var checkInTime = isAbsent ? null : new Date(dateObj.setHours(checkInHour, checkInMin, 0));
                            var checkOutTime = isAbsent ? null : new Date(dateObj.setHours(checkInHour + 9, checkInMin, 0));
                            var workDurationMinutes = isAbsent ? 0 : 480;
                            var breakDurationMinutes = isAbsent ? 0 : 60;
                            var lateMinutes = checkInHour >= 10 ? 30 : 0;
                            var locDoc = locationDocs[((_o = LOCATION_DEFS.find(function (l) { return l.code === emp.locationCode; })) === null || _o === void 0 ? void 0 : _o.code) || "HYD"];
                            var baseLat = ((_p = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _p === void 0 ? void 0 : _p.latitude) || 17.3850;
                            var baseLng = ((_q = locDoc === null || locDoc === void 0 ? void 0 : locDoc.coordinates) === null || _q === void 0 ? void 0 : _q.longitude) || 78.4867;
                            attendanceRecordsBatch.push({
                                companyId: company._id,
                                employeeId: emp._id,
                                locationId: emp.locationId,
                                date: dateStr,
                                checkInTime: checkInTime,
                                checkOutTime: checkOutTime,
                                workDurationMinutes: workDurationMinutes,
                                workingHours: Number((workDurationMinutes / 60).toFixed(2)),
                                breakDurationMinutes: breakDurationMinutes,
                                overtimeMinutes: 0,
                                lateMinutes: lateMinutes,
                                earlyDepartureMinutes: 0,
                                status: status_1,
                                shiftKind: "Regular",
                                checkInCoordinates: isAbsent ? undefined : { lat: baseLat + (prng.range(-20, 20) / 10000), lng: baseLng + (prng.range(-20, 20) / 10000) },
                                checkOutCoordinates: isAbsent ? undefined : { lat: baseLat + (prng.range(-20, 20) / 10000), lng: baseLng + (prng.range(-20, 20) / 10000) },
                            });
                            productivityRecordsBatch.push({
                                companyId: company._id,
                                employeeId: emp._id,
                                date: dateStr,
                                hoursLogged: isAbsent ? 0 : 8,
                                tasksCompleted: isAbsent ? 0 : prng.range(2, 6),
                                efficiencyScore: isAbsent ? 0 : prng.range(75, 98),
                                idleTimeMinutes: isAbsent ? 0 : prng.range(15, 45),
                            });
                        };
                        for (_k = 0, createdEmployees_4 = createdEmployees; _k < createdEmployees_4.length; _k++) {
                            emp = createdEmployees_4[_k];
                            _loop_3(emp);
                        }
                    }
                    // Insert batches of 1000 to manage RAM memory
                    console.log("[Seed Engine] Inserting ".concat(attendanceRecordsBatch.length, " attendance records in memory-managed batches..."));
                    _t.label = 42;
                case 42:
                    if (!(attendanceRecordsBatch.length > 0)) return [3 /*break*/, 44];
                    chunk = attendanceRecordsBatch.splice(0, 1000);
                    return [4 /*yield*/, AttendanceRecord_js_1.default.insertMany(chunk, { ordered: false })];
                case 43:
                    _t.sent();
                    return [3 /*break*/, 42];
                case 44:
                    if (!(productivityRecordsBatch.length > 0)) return [3 /*break*/, 46];
                    chunk = productivityRecordsBatch.splice(0, 1000);
                    return [4 /*yield*/, ProductivityRecord_js_1.default.insertMany(chunk, { ordered: false })];
                case 45:
                    _t.sent();
                    return [3 /*break*/, 44];
                case 46:
                    // Seed sample tasks & audit logs
                    for (t = 1; t <= 50; t++) {
                        emp = prng.choice(createdEmployees);
                        tasksBatch.push({
                            companyId: company._id,
                            title: "Quarterly Milestone Deliverable #".concat(t),
                            description: "Complete task requirements for module #".concat(t),
                            assignedTo: emp._id,
                            assignedBy: emp.managerId || emp._id,
                            departmentId: emp.departmentId,
                            teamId: emp.teamId,
                            status: prng.choice(["To Do", "In Progress", "Completed"]),
                            priority: prng.choice(["Low", "Medium", "High", "Critical"]),
                            dueDate: new Date(Date.now() + prng.range(1, 14) * 24 * 60 * 60 * 1000),
                        });
                    }
                    return [4 /*yield*/, Task_js_1.default.insertMany(tasksBatch)];
                case 47:
                    _t.sent();
                    return [4 /*yield*/, AuditLog_js_1.default.create({
                            companyId: company._id,
                            performedBy: "Seed Engine",
                            userRole: "System",
                            action: "DATABASE_SEED_COMPLETE",
                            details: "Successfully seeded 250 employees across 5 locations with 12 months historical records.",
                        })];
                case 48:
                    _t.sent();
                    console.log("[Seed Engine] Seeding completed successfully!");
                    return [4 /*yield*/, printCollectionCounts()];
                case 49:
                    _t.sent();
                    if (!(((_r = process.argv[1]) === null || _r === void 0 ? void 0 : _r.includes('seed.ts')) || ((_s = process.argv[1]) === null || _s === void 0 ? void 0 : _s.includes('seedRoles.ts')))) return [3 /*break*/, 51];
                    return [4 /*yield*/, (0, db_js_1.closeDB)()];
                case 50:
                    _t.sent();
                    _t.label = 51;
                case 51: return [2 /*return*/];
            }
        });
    });
}
function printCollectionCounts() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
        return __generator(this, function (_14) {
            switch (_14.label) {
                case 0:
                    console.log("\n=================== SEED SUMMARY REPORT ===================");
                    _b = (_a = console).log;
                    _c = "Companies           : ".concat;
                    return [4 /*yield*/, Company_js_1.default.countDocuments()];
                case 1:
                    _b.apply(_a, [_c.apply("Companies           : ", [_14.sent()])]);
                    _e = (_d = console).log;
                    _f = "Locations           : ".concat;
                    return [4 /*yield*/, Location_js_1.default.countDocuments()];
                case 2:
                    _e.apply(_d, [_f.apply("Locations           : ", [_14.sent()])]);
                    _h = (_g = console).log;
                    _j = "Departments         : ".concat;
                    return [4 /*yield*/, Department_js_1.default.countDocuments()];
                case 3:
                    _h.apply(_g, [_j.apply("Departments         : ", [_14.sent()])]);
                    _l = (_k = console).log;
                    _m = "Teams               : ".concat;
                    return [4 /*yield*/, Team_js_1.default.countDocuments()];
                case 4:
                    _l.apply(_k, [_m.apply("Teams               : ", [_14.sent()])]);
                    _p = (_o = console).log;
                    _q = "Users               : ".concat;
                    return [4 /*yield*/, User_js_1.User.countDocuments()];
                case 5:
                    _p.apply(_o, [_q.apply("Users               : ", [_14.sent()])]);
                    _s = (_r = console).log;
                    _t = "Employees           : ".concat;
                    return [4 /*yield*/, Employee_js_1.default.countDocuments()];
                case 6:
                    _s.apply(_r, [_t.apply("Employees           : ", [_14.sent()])]);
                    _v = (_u = console).log;
                    _w = "Shifts              : ".concat;
                    return [4 /*yield*/, Shift_js_1.default.countDocuments()];
                case 7:
                    _v.apply(_u, [_w.apply("Shifts              : ", [_14.sent()])]);
                    _y = (_x = console).log;
                    _z = "Attendance Records  : ".concat;
                    return [4 /*yield*/, AttendanceRecord_js_1.default.countDocuments()];
                case 8:
                    _y.apply(_x, [_z.apply("Attendance Records  : ", [_14.sent()])]);
                    _1 = (_0 = console).log;
                    _2 = "Performance Records : ".concat;
                    return [4 /*yield*/, PerformanceRecord_js_1.default.countDocuments()];
                case 9:
                    _1.apply(_0, [_2.apply("Performance Records : ", [_14.sent()])]);
                    _4 = (_3 = console).log;
                    _5 = "Productivity Records: ".concat;
                    return [4 /*yield*/, ProductivityRecord_js_1.default.countDocuments()];
                case 10:
                    _4.apply(_3, [_5.apply("Productivity Records: ", [_14.sent()])]);
                    _7 = (_6 = console).log;
                    _9 = "Skills & EmpSkills  : ".concat;
                    return [4 /*yield*/, Skill_js_1.default.countDocuments()];
                case 11:
                    _10 = (_8 = _9.apply("Skills & EmpSkills  : ", [_14.sent(), " skills, "])).concat;
                    return [4 /*yield*/, EmployeeSkill_js_1.default.countDocuments()];
                case 12:
                    _7.apply(_6, [_10.apply(_8, [_14.sent(), " employee skills"])]);
                    _12 = (_11 = console).log;
                    _13 = "Tasks               : ".concat;
                    return [4 /*yield*/, Task_js_1.default.countDocuments()];
                case 13:
                    _12.apply(_11, [_13.apply("Tasks               : ", [_14.sent()])]);
                    console.log("===========================================================\n");
                    return [2 /*return*/];
            }
        });
    });
}
// CLI runner
if ((_a = process.argv[1]) === null || _a === void 0 ? void 0 : _a.includes("seed.ts")) {
    var resetFlag = process.argv.includes("--reset");
    runSeed(resetFlag).catch(function (err) {
        console.error("[Seed Engine] Fatal Error:", err);
        process.exit(1);
    });
}
