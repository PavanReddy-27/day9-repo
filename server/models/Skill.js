"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var skillSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Frontend", "Backend", "HR", "Finance"
    description: { type: String, default: "" },
}, { timestamps: true });
skillSchema.index({ companyId: 1, name: 1 }, { unique: true });
exports.default = mongoose_1.default.models.Skill || mongoose_1.default.model("Skill", skillSchema, "skills");
