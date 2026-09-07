"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var shiftSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
        type: String,
        required: true,
        enum: ["Regular", "Flexible", "Night", "CrossMidnight"],
        default: "Regular",
    },
    startTime: { type: String, required: true }, // Format "HH:mm" e.g., "09:00"
    endTime: { type: String, required: true }, // Format "HH:mm" e.g., "17:00"
    breakDurationMinutes: { type: Number, default: 60 },
    workDurationMinutes: { type: Number, default: 480 },
    workingHours: { type: Number, default: 8 },
}, { timestamps: true });
shiftSchema.index({ companyId: 1, code: 1 }, { unique: true });
exports.default = mongoose_1.default.models.Shift || mongoose_1.default.model("Shift", shiftSchema, "shifts");
