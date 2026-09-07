"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var tokenBlacklistSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Automatically delete after 24 hours (86400 seconds)
    },
});
var TokenBlacklist = mongoose_1.default.models.TokenBlacklist || mongoose_1.default.model("TokenBlacklist", tokenBlacklistSchema);
exports.default = TokenBlacklist;
