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
exports.closeDB = exports.getDBHealth = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var mongodb_memory_server_1 = require("mongodb-memory-server");
var memoryServer = null;
var connectDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var conn, error_1, uri_1, conn;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (mongoose_1.default.connection.readyState === 1) {
                    return [2 /*return*/, mongoose_1.default.connection];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 9]);
                if (!process.env.MONGODB_URI) return [3 /*break*/, 3];
                return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })];
            case 2:
                conn = _c.sent();
                console.log('MongoDB Connected successfully.');
                return [2 /*return*/, conn];
            case 3: throw new Error('No MONGODB_URI provided');
            case 4:
                error_1 = _c.sent();
                console.warn("Real MongoDB connection failed (".concat(error_1.message, ")."));
                if (!(process.env.USE_IN_MEMORY_DB === 'true')) return [3 /*break*/, 7];
                console.warn('USE_IN_MEMORY_DB is true. Falling back to In-Memory DB...');
                return [4 /*yield*/, mongodb_memory_server_1.MongoMemoryReplSet.create({ replSet: { count: 1 } })];
            case 5:
                memoryServer = _c.sent();
                uri_1 = memoryServer.getUri();
                return [4 /*yield*/, mongoose_1.default.connect(uri_1)];
            case 6:
                conn = _c.sent();
                console.log('In-Memory MongoDB Connected');
                if (!((_a = process.argv[1]) === null || _a === void 0 ? void 0 : _a.includes('seed.ts')) && !((_b = process.argv[1]) === null || _b === void 0 ? void 0 : _b.includes('seedRoles.ts'))) {
                    console.log('Running automatic seed for In-Memory DB...');
                    Promise.resolve().then(function () { return __importStar(require('../seed/seed.js')); }).then(function (_a) {
                        var runSeed = _a.runSeed;
                        process.env.MONGODB_URI = uri_1;
                        runSeed(false).catch(function (err) { return console.error('Seed error:', err); });
                    }).catch(function (err) {
                        console.error('Failed to load seed script:', err);
                    });
                }
                return [2 /*return*/, conn];
            case 7:
                console.error('In-Memory DB fallback is disabled. Set USE_IN_MEMORY_DB=true to enable it.');
                throw error_1;
            case 8: return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
var READY_STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};
var getDBHealth = function () {
    var _a;
    var readyState = mongoose_1.default.connection.readyState;
    return {
        status: readyState === 1 ? "healthy" : "unhealthy",
        state: (_a = READY_STATES[readyState]) !== null && _a !== void 0 ? _a : "unknown",
        host: mongoose_1.default.connection.host,
        name: mongoose_1.default.connection.name,
        inMemory: false,
    };
};
exports.getDBHealth = getDBHealth;
var closeDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, mongoose_1.default.connection.close()];
            case 1:
                _a.sent();
                if (!memoryServer) return [3 /*break*/, 3];
                return [4 /*yield*/, memoryServer.stop()];
            case 2:
                _a.sent();
                memoryServer = null;
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.closeDB = closeDB;
exports.default = connectDB;
