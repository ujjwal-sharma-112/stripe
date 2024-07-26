"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
const user_type_1 = require("../types/user.type");
const validators_1 = require("../validators");
class AdminController {
    static async changeStatus(req, res, next) {
        try {
            if (req.role !== user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed here.", "Not Authorized");
            }
            const { error } = await validators_1.UserValidator.changeStatus(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const isValidId = mongoose_1.default.Types.ObjectId.isValid(req.body._id);
            if (!isValidId) {
                throw middlewares_1.ErrorHandler.notAcceptable("Id format not accepted.", "Not Acceptable");
            }
            const userExists = await models_1.UserModel.findOne({ _id: req.body._id });
            if (!userExists) {
                throw middlewares_1.ErrorHandler.notFound("User not found", "Not Found");
            }
            if (userExists.role === user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.conflict("Admin cannot update itself", "User Conflict");
            }
            await models_1.UserModel.findOneAndUpdate({ _id: req.body._id }, { status: req.body.status, isVerified: false, isApproved: false }, { new: true });
            return res.status(200).json({
                message: "User Status Changed.",
            });
        }
        catch (error) {
            return next(error);
        }
    }
    static async handleKyc(req, res, next) {
        try {
            if (req.role !== user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed to be here", "Not Authorized");
            }
            const { error } = await validators_1.AdminValidator.handleKyc(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const kycInfo = models_1.KYCModel.findOne({
                _id: req.body.kycId,
                userId: req.body.userId,
            });
            if (!kycInfo) {
                throw middlewares_1.ErrorHandler.notFound("No Kyc Info found", "Not Found");
            }
            await models_1.KYCModel.findOneAndUpdate({ _id: req.body.kycId, userId: req.body.userId }, { kyc_status: req.body.status });
            res.status(200).json({
                message: "Kyc has been handled",
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async getKycRequestUsers(req, res, next) {
        var _a, _b, _c;
        try {
            if (req.role !== user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed here!", "Not Authorized");
            }
            const { page, limit, orderBy = "createdAt", order = 1, email, firstName, lastName, phone, from, to, } = req.query;
            const options = {
                page: parseInt((_a = String(page)) !== null && _a !== void 0 ? _a : "1", 10),
                limit: parseInt((_b = String(limit)) !== null && _b !== void 0 ? _b : "10", 10),
                sort: { [orderBy]: (_c = parseInt(String(order))) !== null && _c !== void 0 ? _c : -1 },
            };
            const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
            const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
            const emailRegex = email ? new RegExp(email, "i") : null;
            const phoneNumber = phone ? Number(phone) : null;
            const matchCriteria = {};
            if (from || to) {
                matchCriteria["userInfo.createdAt"] = {};
                if (from) {
                    matchCriteria["userInfo.createdAt"].$gte = new Date(from);
                }
                if (to) {
                    matchCriteria["userInfo.createdAt"].$lte = new Date(to);
                }
            }
            if (firstNameRegex ||
                lastNameRegex ||
                emailRegex ||
                phoneNumber !== null) {
                matchCriteria.$or = [];
                if (firstNameRegex) {
                    matchCriteria.$or.push({
                        "userInfo.first_name": { $regex: firstNameRegex },
                    });
                }
                if (lastNameRegex) {
                    matchCriteria.$or.push({
                        "userInfo.last_name": { $regex: lastNameRegex },
                    });
                }
                if (emailRegex) {
                    matchCriteria.$or.push({ "userInfo.email": { $regex: emailRegex } });
                }
                if (phoneNumber !== null) {
                    matchCriteria.$or.push({ "userInfo.phone": phoneNumber });
                }
            }
            const pipeline = [
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                {
                    $unwind: {
                        path: "$userInfo",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $match: matchCriteria },
                {
                    $project: {
                        "userInfo.qr": 0,
                        "userInfo.password": 0,
                        "userInfo.salt": 0,
                        "userInfo.otp": 0,
                        "userInfo.otpTime": 0,
                    },
                },
            ];
            const userAggregate = models_1.KYCModel.aggregate(pipeline);
            const users = await models_1.KYCModel.aggregatePaginate(userAggregate, options);
            if (users.docs.length === 0) {
                throw middlewares_1.ErrorHandler.notFound("Students not found", "Not Found");
            }
            return res.status(200).json({
                message: "Users fetched successfully",
                users,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getApprovedKycUsers(req, res, next) {
        var _a, _b, _c;
        try {
            if (req.role !== user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed here!", "Not Authorized");
            }
            const { page, limit, orderBy = "createdAt", order = 1, email, firstName, lastName, from, to, } = req.query;
            const options = {
                page: parseInt((_a = String(page)) !== null && _a !== void 0 ? _a : "1", 10),
                limit: parseInt((_b = String(limit)) !== null && _b !== void 0 ? _b : "10", 10),
                sort: { [orderBy]: (_c = parseInt(String(order))) !== null && _c !== void 0 ? _c : -1 },
            };
            const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
            const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
            const emailRegex = email ? new RegExp(email, "i") : null;
            const matchCriteria = {
                role: { $ne: user_type_1.Role.ADMIN },
            };
            if (firstNameRegex || lastNameRegex || emailRegex) {
                matchCriteria.$or = [];
                if (firstNameRegex) {
                    matchCriteria.$or.push({ first_name: { $regex: firstNameRegex } });
                }
                if (lastNameRegex) {
                    matchCriteria.$or.push({ last_name: { $regex: lastNameRegex } });
                }
                if (emailRegex) {
                    matchCriteria.$or.push({ email: { $regex: emailRegex } });
                }
            }
            if (from || to) {
                matchCriteria["kycInfo.createdAt"] = {};
                if (from) {
                    matchCriteria["kycInfo.createdAt"].$gte = new Date(from);
                }
                if (to) {
                    matchCriteria["kycInfo.createdAt"].$lte = new Date(to);
                }
            }
            const pipeline = [
                { $match: matchCriteria },
                {
                    $lookup: {
                        from: "kycs",
                        localField: "_id",
                        foreignField: "userId",
                        as: "kycInfo",
                    },
                },
                {
                    $unwind: {
                        path: "$kycInfo",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $match: { "kycInfo.kyc_status": "APPROVED" },
                },
                {
                    $project: {
                        qr: 0,
                        password: 0,
                        salt: 0,
                        otp: 0,
                        otpTime: 0,
                    },
                },
            ];
            const userAggregate = models_1.UserModel.aggregate(pipeline);
            const users = await models_1.UserModel.aggregatePaginate(userAggregate, options);
            if (users.docs.length === 0) {
                throw middlewares_1.ErrorHandler.notFound("Students not found", "Not Found");
            }
            return res.status(200).json({
                message: "Users fetched successfully",
                users,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    static async getAllUsers(req, res, next) {
        var _a, _b, _c;
        try {
            if (req.role !== user_type_1.Role.ADMIN) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed here!", "Not Authorized");
            }
            const { page, limit, orderBy = "createdAt", order = 1, email, firstName, lastName, from, to, } = req.query;
            const options = {
                page: parseInt((_a = String(page)) !== null && _a !== void 0 ? _a : "1", 10),
                limit: parseInt((_b = String(limit)) !== null && _b !== void 0 ? _b : "10", 10),
                sort: { [orderBy]: (_c = parseInt(String(order))) !== null && _c !== void 0 ? _c : -1 },
            };
            const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
            const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
            const emailRegex = email ? new RegExp(email, "i") : null;
            const matchCriteria = {
                role: { $ne: user_type_1.Role.ADMIN },
            };
            if (firstNameRegex || lastNameRegex || emailRegex) {
                matchCriteria.$or = [];
                if (firstNameRegex) {
                    matchCriteria.$or.push({ first_name: { $regex: firstNameRegex } });
                }
                if (lastNameRegex) {
                    matchCriteria.$or.push({ last_name: { $regex: lastNameRegex } });
                }
                if (emailRegex) {
                    matchCriteria.$or.push({ email: { $regex: emailRegex } });
                }
            }
            if (from || to) {
                matchCriteria.createdAt = {};
                if (from) {
                    matchCriteria.createdAt.$gte = new Date(from);
                }
                if (to) {
                    matchCriteria.createdAt.$lte = new Date(to);
                }
            }
            const pipeline = [
                { $match: matchCriteria },
                {
                    $project: {
                        qr: 0,
                        password: 0,
                        salt: 0,
                        otp: 0,
                        otpTime: 0,
                    },
                },
            ];
            const userAggregate = models_1.UserModel.aggregate(pipeline);
            const users = await models_1.UserModel.aggregatePaginate(userAggregate, options);
            if (users.docs.length === 0) {
                throw middlewares_1.ErrorHandler.notFound("Students not found", "Not Found");
            }
            return res.status(200).json({
                message: "Users fetched successfully",
                users,
            });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = AdminController;
//# sourceMappingURL=admin.controller.js.map