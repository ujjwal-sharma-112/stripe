"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const faqSchema = new mongoose_1.default.Schema({
    ques: String,
    sol: String,
}, {
    timestamps: true,
});
const FaqModel = mongoose_1.default.model("faq", faqSchema);
exports.default = FaqModel;
//# sourceMappingURL=faq.model.js.map