"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminValidator {
    static async handleKyc(req) {
        const schema = joi_1.default.object({
            kycId: joi_1.default.string().required(),
            userId: joi_1.default.string().required(),
            status: joi_1.default.string().valid("APPROVED", "REJECTED").required(),
        });
        return schema.validate(req, { abortEarly: false });
    }
}
exports.default = AdminValidator;
//# sourceMappingURL=admin.validator.js.map