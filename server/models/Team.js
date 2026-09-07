"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var teamSchema = new mongoose_1.default.Schema({
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company', required: true },
    department: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Team', teamSchema);
