"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidator = exports.UserValidator = exports.AuthValidator = void 0;
var auth_validator_1 = require("./auth.validator");
Object.defineProperty(exports, "AuthValidator", { enumerable: true, get: function () { return __importDefault(auth_validator_1).default; } });
var user_validator_1 = require("./user.validator");
Object.defineProperty(exports, "UserValidator", { enumerable: true, get: function () { return __importDefault(user_validator_1).default; } });
var admin_validator_1 = require("./admin.validator");
Object.defineProperty(exports, "AdminValidator", { enumerable: true, get: function () { return __importDefault(admin_validator_1).default; } });
//# sourceMappingURL=index.js.map