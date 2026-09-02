"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var idempotencyRecordSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    idempotencyKey: { type: String, required: true, index: true },
    requestPath: { type: String, required: true },
    requestHash: { type: String, default: "" },
    responseStatus: { type: Number, required: true },
    responseBody: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto TTL index
}, { timestamps: true });
idempotencyRecordSchema.index({ companyId: 1, idempotencyKey: 1 }, { unique: true });
exports.default = mongoose_1.default.models.IdempotencyRecord || mongoose_1.default.model("IdempotencyRecord", idempotencyRecordSchema, "idempotencyrecords");
