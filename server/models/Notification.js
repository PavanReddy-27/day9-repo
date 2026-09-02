"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var notificationSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["INFO", "WARNING", "SUCCESS", "ALERT"], default: "INFO" },
    isRead: { type: Boolean, default: false },
    linkUrl: { type: String, default: "" },
}, { timestamps: true });
notificationSchema.index({ companyId: 1, userId: 1, isRead: 1 });
exports.default = mongoose_1.default.models.Notification || mongoose_1.default.model("Notification", notificationSchema, "notifications");
