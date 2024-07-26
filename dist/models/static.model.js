"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const staticSchema = new mongoose_1.default.Schema({
    terms_and_conditions: {
        type: {
            title: String,
            content: String
        },
        default: {
            title: "Terms & Conditions",
            content: "This is the terms and conditions content",
        },
    },
    privacy_policy: {
        type: {
            title: String,
            content: String
        },
        default: {
            title: "Privacy Policy",
            content: "This is the privacy policy content",
        },
    },
    about_us: {
        type: {
            title: String,
            content: String
        },
        default: {
            title: "About Us",
            content: "This is the about us content",
        },
    },
});
const StaticModel = mongoose_1.default.model("static", staticSchema);
exports.default = StaticModel;
//# sourceMappingURL=static.model.js.map