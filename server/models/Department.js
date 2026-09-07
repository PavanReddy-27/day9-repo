"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var departmentSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Department', departmentSchema);
