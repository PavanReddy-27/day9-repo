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
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var dotenv_1 = __importDefault(require("dotenv"));
var db_js_1 = __importStar(require("./config/db.js"));
var api_js_1 = __importDefault(require("./routes/api.js"));
var User_js_1 = require("./models/User.js");
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
// Security & Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "2mb" }));
// Rate Limiting
var apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, message: "Too many requests from this IP, please try again later." },
});
app.use("/api/v1", apiLimiter);
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// API Routes
app.use("/api/v1", api_js_1.default);
// Serve static frontend in production
app.use(express_1.default.static(path_1.default.join(__dirname, "../dist")));
app.get(/.*/, function (req, res, next) {
    if (req.path.startsWith("/api/"))
        return next();
    res.sendFile(path_1.default.join(__dirname, "../dist/index.html"));
});
// Centralized Error Handler
app.use(function (err, req, res, next) {
    console.error("[Backend Error]", err.message, err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
var server;
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var userCount, runSeed, seedErr_1, currentPort, tryListen, gracefulShutdown;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_js_1.default)()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, User_js_1.AdminAuth.countDocuments()];
                case 3:
                    userCount = _a.sent();
                    if (!(userCount === 0)) return [3 /*break*/, 6];
                    console.log("[Server] Database is empty. Seeding initial accounts...");
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./seed/seed.js")); })];
                case 4:
                    runSeed = (_a.sent()).runSeed;
                    return [4 /*yield*/, runSeed(false)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    seedErr_1 = _a.sent();
                    console.error("[Server] Auto-seed check error:", seedErr_1.message);
                    return [3 /*break*/, 8];
                case 8:
                    currentPort = parseInt(PORT, 10);
                    tryListen = function (portToTry) {
                        server = app
                            .listen(portToTry, function () {
                            console.log("[Express Backend] Server running on http://localhost:".concat(portToTry));
                        })
                            .on("error", function (err) {
                            if (err.code === "EADDRINUSE") {
                                console.warn("[Server] Port ".concat(portToTry, " in use, trying port ").concat(portToTry + 1, "..."));
                                tryListen(portToTry + 1);
                            }
                            else {
                                console.error("[Server Error]", err);
                            }
                        });
                    };
                    tryListen(currentPort);
                    gracefulShutdown = function (signal) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("[Server] Received ".concat(signal, ". Shutting down gracefully..."));
                                    if (!server) return [3 /*break*/, 1];
                                    server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, (0, db_js_1.closeDB)()];
                                                case 1:
                                                    _a.sent();
                                                    console.log("[Server] Closed all connections.");
                                                    process.exit(0);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [3 /*break*/, 3];
                                case 1: return [4 /*yield*/, (0, db_js_1.closeDB)()];
                                case 2:
                                    _a.sent();
                                    process.exit(0);
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    process.on("SIGINT", function () { return gracefulShutdown("SIGINT"); });
                    process.on("SIGTERM", function () { return gracefulShutdown("SIGTERM"); });
                    return [2 /*return*/];
            }
        });
    });
}
if ((_a = process.argv[1]) === null || _a === void 0 ? void 0 : _a.includes("index.ts")) {
    startServer();
}
exports.default = app;
