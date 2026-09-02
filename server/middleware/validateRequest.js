"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
var zod_1 = require("zod");
/**
 * Validates request payload against a Zod schema.
 * Supports validating body, query, and params.
 */
var validateRequest = function (schema, property) {
    if (property === void 0) { property = "body"; }
    return function (req, res, next) {
        try {
            req[property] = schema.parse(req[property]);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: (error.issues || error.errors || []).map(function (e) { return ({
                        field: e.path ? e.path.join(".") : "unknown",
                        message: e.message,
                    }); }),
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
