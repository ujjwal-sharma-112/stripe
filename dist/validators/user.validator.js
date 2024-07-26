"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class UserValidator {
    static async updateProfile(req) {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().min(3).max(30),
            last_name: joi_1.default.string().min(3).max(30),
            email: joi_1.default.string().email(),
            phone: joi_1.default.number(),
            address: {
                city: joi_1.default.string(),
                country: joi_1.default.string(),
                state: joi_1.default.string(),
            },
        });
        return schema.validate(req, { abortEarly: false });
    }
    static async changeStatus(req) {
        const schema = joi_1.default.object({
            _id: joi_1.default.string().required(),
            status: joi_1.default.string().valid("BLOCKED", "DELETED", "PENDING").required(),
        });
        return schema.validate(req, { abortEarly: false });
    }
    static async changePassword(req) {
        const schema = joi_1.default.object({
            confirmPassword: joi_1.default.string().valid(joi_1.default.ref("newPassword")).required(),
            oldPassword: joi_1.default.string().required(),
            newPassword: joi_1.default.string().required(),
        });
        return schema.validate(req, { abortEarly: false });
    }
    static async disable2fa(req) {
        const schema = joi_1.default.object({
            token: joi_1.default.string().required(),
        });
        return schema.validate(req, { abortEarly: false });
    }
    static async verifyOtp(req) {
        const schema = joi_1.default.object({
            token: joi_1.default.string().required(),
            userId: joi_1.default.string().required(),
        });
        return schema.validate(req, { abortEarly: false });
    }
}
exports.default = UserValidator;
//# sourceMappingURL=user.validator.js.map