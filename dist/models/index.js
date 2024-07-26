"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = exports.KYCModel = exports.UserModel = exports.FaqModel = exports.StaticModel = void 0;
var static_model_1 = require("./static.model");
Object.defineProperty(exports, "StaticModel", { enumerable: true, get: function () { return __importDefault(static_model_1).default; } });
var faq_model_1 = require("./faq.model");
Object.defineProperty(exports, "FaqModel", { enumerable: true, get: function () { return __importDefault(faq_model_1).default; } });
var user_model_1 = require("./user.model");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return __importDefault(user_model_1).default; } });
var kyc_model_1 = require("./kyc.model");
Object.defineProperty(exports, "KYCModel", { enumerable: true, get: function () { return __importDefault(kyc_model_1).default; } });
var transaction_model_1 = require("./transaction.model");
Object.defineProperty(exports, "TransactionModel", { enumerable: true, get: function () { return __importDefault(transaction_model_1).default; } });
//# sourceMappingURL=index.js.map