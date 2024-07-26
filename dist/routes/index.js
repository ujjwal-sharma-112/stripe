"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = exports.AdminRoutes = exports.AuthRoutes = void 0;
var auth_route_1 = require("./auth.route");
Object.defineProperty(exports, "AuthRoutes", { enumerable: true, get: function () { return __importDefault(auth_route_1).default; } });
var admin_rotue_1 = require("./admin.rotue");
Object.defineProperty(exports, "AdminRoutes", { enumerable: true, get: function () { return __importDefault(admin_rotue_1).default; } });
var user_route_1 = require("./user.route");
Object.defineProperty(exports, "UserRoutes", { enumerable: true, get: function () { return __importDefault(user_route_1).default; } });
//# sourceMappingURL=index.js.map