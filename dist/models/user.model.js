"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
exports.userSchema = new mongoose_1.default.Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    user_name: {
        type: String,
    },
    password: {
        type: String,
    },
    salt: {
        type: String,
    },
    address: {
        type: {
            country: {
                type: String,
            },
            state: {
                type: String,
            },
            city: {
                type: String,
            },
        },
    },
    dialing_code: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: Number,
    },
    otpTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "PENDING", "BLOCKED", "DELETED"],
        default: "PENDING",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    qr: {
        type: String,
    },
    planId: {
        type: Number,
        default: 1,
    },
    creditBalance: {
        type: Number,
        default: 20,
    },
    enabled_2fa: {
        type: Boolean,
        default: false,
    },
    perm_secret: {
        type: Object,
        default: null,
    },
    temp_secret: {
        type: Object,
        default: null,
    },
}, { timestamps: true });
exports.userSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
const UserModel = mongoose_1.default.model("users", exports.userSchema);
exports.default = UserModel;
//# sourceMappingURL=user.model.js.map