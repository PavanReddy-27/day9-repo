"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var locationSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company', required: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    geofenceRadiusMeters: { type: Number, default: 500 },
    targetEmployeeCount: { type: Number },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
locationSchema.index({ companyId: 1 });
exports.default = mongoose_1.default.models.Location || mongoose_1.default.model('Location', locationSchema);
