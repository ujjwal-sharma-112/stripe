"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const TransactionSchema = new mongoose_1.Schema({
    stripeId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    plan: {
        type: String,
    },
    credits: {
        type: Number,
    },
    buyer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
}, {
    timestamps: true
});
TransactionSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
const TransactionModel = (0, mongoose_1.model)("transactions", TransactionSchema);
exports.default = TransactionModel;
//# sourceMappingURL=transaction.model.js.map