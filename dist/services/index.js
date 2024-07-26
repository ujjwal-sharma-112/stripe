"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticService = exports.MailService = exports.JWTService = exports.DbService = exports.AdminService = void 0;
var admin_service_1 = require("./admin.service");
Object.defineProperty(exports, "AdminService", { enumerable: true, get: function () { return __importDefault(admin_service_1).default; } });
var db_service_1 = require("./db.service");
Object.defineProperty(exports, "DbService", { enumerable: true, get: function () { return __importDefault(db_service_1).default; } });
var JWT_service_1 = require("./JWT.service");
Object.defineProperty(exports, "JWTService", { enumerable: true, get: function () { return __importDefault(JWT_service_1).default; } });
var mail_service_1 = require("./mail.service");
Object.defineProperty(exports, "MailService", { enumerable: true, get: function () { return __importDefault(mail_service_1).default; } });
var static_service_1 = require("./static.service");
Object.defineProperty(exports, "StaticService", { enumerable: true, get: function () { return __importDefault(static_service_1).default; } });
//# sourceMappingURL=index.js.map