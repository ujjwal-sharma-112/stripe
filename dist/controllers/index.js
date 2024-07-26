"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = exports.UserController = exports.AuthController = void 0;
var auth_controller_1 = require("./auth.controller");
Object.defineProperty(exports, "AuthController", { enumerable: true, get: function () { return __importDefault(auth_controller_1).default; } });
var user_controller_1 = require("./user.controller");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return __importDefault(user_controller_1).default; } });
var admin_controller_1 = require("./admin.controller");
Object.defineProperty(exports, "AdminController", { enumerable: true, get: function () { return __importDefault(admin_controller_1).default; } });
//# sourceMappingURL=index.js.map