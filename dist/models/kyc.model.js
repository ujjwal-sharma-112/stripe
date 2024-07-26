"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const kycSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Types.ObjectId,
    },
    address: {
        type: {
            house_no: String,
            city: String,
            state: String,
            country: String,
        },
    },
    pan_card: {
        type: String,
    },
    adhaar_card: {
        type: String,
    },
    passport: {
        type: String,
    },
    drivers_id: {
        type: String,
    },
    image: {
        type: String,
    },
    kyc_status: {
        type: String,
        enum: ["PENDING", "REJECTED", "APPROVED"],
        default: "PENDING",
    },
}, { timestamps: true });
kycSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
const KYCModel = mongoose_1.default.model("kycs", kycSchema);
exports.default = KYCModel;
//# sourceMappingURL=kyc.model.js.map