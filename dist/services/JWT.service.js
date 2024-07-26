"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middlewares_1 = require("../middlewares");
class JWTService {
    static generate(payload) {
        try {
            return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
        }
        catch (err) {
            throw middlewares_1.ErrorHandler.internal(`Error: ${err}`, "Internal Error");
        }
    }
    static decode(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            throw middlewares_1.ErrorHandler.internal(`Error: ${error}`, "Internal Error");
        }
    }
}
exports.default = JWTService;
//# sourceMappingURL=JWT.service.js.map