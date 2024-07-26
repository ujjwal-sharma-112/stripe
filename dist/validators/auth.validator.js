"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AuthValidator {
    static async signUp(body) {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string(),
            user_name: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
            phone: joi_1.default.number().max(9999999999).min(1000000000).required(),
            dialing_code: joi_1.default.number(),
            address: {
                city: joi_1.default.string().required(),
                state: joi_1.default.string().required(),
                country: joi_1.default.string().required(),
            },
        });
        return schema.validate(body, { abortEarly: false });
    }
    static async login(body) {
        const schema = joi_1.default
            .object({
            email: joi_1.default.string(),
            username: joi_1.default.string(),
            phone: joi_1.default.number().max(9999999999).min(1000000000).messages({
                "number.min": "Please provide atleast 10 digits",
                "number.max": "Please provide only 10 digits",
            }),
            password: joi_1.default.string().required(),
        })
            .or("email", "username", "phone");
        return schema.validate(body, { abortEarly: false });
    }
    static async verifyOtp(body) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            otp: joi_1.default.number().required(),
        });
        return schema.validate(body, { abortEarly: false });
    }
    static async resendOtp(body) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
        });
        return schema.validate(body, { abortEarly: false });
    }
    static async forgotPassword(body) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
        });
        return schema.validate(body, { abortEarly: false });
    }
}
exports.default = AuthValidator;
//# sourceMappingURL=auth.validator.js.map