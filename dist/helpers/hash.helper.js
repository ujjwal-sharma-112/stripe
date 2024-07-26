"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Hash {
    static generate(text) {
        const salt = crypto_1.default.randomBytes(16).toString("hex");
        const hash = crypto_1.default.pbkdf2Sync(text, salt, 10000, 64, 'sha512').toString("hex");
        return {
            salt,
            hash
        };
    }
    static compare(text, hash, salt) {
        const checkHash = crypto_1.default.pbkdf2Sync(text, salt, 10000, 64, 'sha512').toString("hex");
        return hash === checkHash;
    }
}
exports.default = Hash;
//# sourceMappingURL=hash.helper.js.map