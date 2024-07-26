"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
const user_type_1 = require("../types/user.type");
const validators_1 = require("../validators");
const services_1 = require("../services");
const helpers_1 = require("../helpers");
const qrcode_1 = __importDefault(require("qrcode"));
class AuthController {
    static async signUp(req, res, next) {
        try {
            const { email, user_name, first_name, last_name, password, phone, dialing_code, address, } = req.body;
            const query = {
                $or: [{ email: email }, { phone: phone }, { user_name: user_name }],
            };
            const { error } = await validators_1.AuthValidator.signUp(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), error.name);
            }
            const userExists = await models_1.UserModel.findOne(query);
            if (userExists && userExists.status === user_type_1.Status.DELETED) {
                if (userExists.email === email &&
                    userExists.phone === phone &&
                    userExists.user_name === user_name) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    await models_1.UserModel.findOneAndUpdate({ email: email, phone: phone, user_name: user_name }, { otp: otp, otpTime: new Date() });
                    await services_1.MailService.sendViaMail(`We saw your account was deleted. If this is really you. You can reactivate you account by verifying the otp we just sent you. Your otp for verification is: ${otp}`, "Otp for Verification", email, next);
                    return res.status(201).json({
                        message: "Your account is deleted. Please check your email",
                    });
                }
            }
            else if (!userExists) {
                const otp = Math.floor(100000 + Math.random() * 900000);
                await services_1.MailService.sendViaMail(`Your otp for verification is: ${otp}`, "Otp for Verification", email, next);
                const { hash, salt } = helpers_1.HashHelper.generate(password);
                const qr = await qrcode_1.default.toDataURL(email);
                const user = await models_1.UserModel.create({
                    first_name: first_name,
                    last_name: last_name,
                    user_name: user_name,
                    email: email,
                    password: hash,
                    salt: salt,
                    phone: phone,
                    dialing_code: dialing_code,
                    address: {
                        city: address.city,
                        country: address.country,
                        state: address.state,
                    },
                    qr: qr,
                    otp: otp,
                    otpTime: new Date(),
                });
                const result = {
                    email: user.email,
                };
                return res.status(201).json({
                    message: "User Created Successfully. Please verify before continue.",
                    result,
                });
            }
            else {
                if (userExists.email === email) {
                    throw middlewares_1.ErrorHandler.conflict("User with provided Email already exist", "User Conflict");
                }
                if (userExists.phone === phone) {
                    throw middlewares_1.ErrorHandler.conflict("User with provided Phone already exist", "User Conflict");
                }
                if (userExists.user_name === user_name) {
                    throw middlewares_1.ErrorHandler.conflict("User with provided user_name already exist", "User Conflict");
                }
            }
        }
        catch (error) {
            return next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, username, phone, password } = req.body;
            const query = {
                $and: [
                    {
                        $or: [{ email: email }, { user_name: username }, { phone: phone }],
                    },
                    { status: { $ne: user_type_1.Status.DELETED } },
                ],
            };
            const { error } = await validators_1.AuthValidator.login(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const userExists = await models_1.UserModel.findOne(query);
            if (!userExists) {
                throw middlewares_1.ErrorHandler.notFound("User not Found", "Not Found");
            }
            if (userExists.isVerified === false) {
                throw middlewares_1.ErrorHandler.unauthorized("Please verify your account first.", "Not Authorized");
            }
            if (userExists.status === user_type_1.Status.BLOCKED) {
                throw middlewares_1.ErrorHandler.unauthorized("You are blocked by admin", "Not Authorized");
            }
            const isPassValid = helpers_1.HashHelper.compare(password, userExists.password, userExists.salt);
            if (!isPassValid) {
                throw middlewares_1.ErrorHandler.unauthorized("Password is not correct.", "Not Authorized");
            }
            if (userExists.enabled_2fa) {
                return res.status(200).json({
                    message: "Please verify 2fa before continuing",
                    userId: userExists._id,
                });
            }
            else {
                const token = services_1.JWTService.generate({
                    _id: userExists._id,
                    email: userExists.email,
                });
                return res.status(200).json({
                    message: "User Logged In.",
                    token: token,
                });
            }
        }
        catch (error) {
            return next(error);
        }
    }
    static async verifyOtp(req, res, next) {
        const { email, otp } = req.body;
        try {
            const { error } = await validators_1.AuthValidator.verifyOtp(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const userExists = await models_1.UserModel.findOne({
                $and: [
                    { email: email },
                    { status: user_type_1.Status.PENDING },
                    { isVerified: false },
                ],
            });
            if (!userExists) {
                throw middlewares_1.ErrorHandler.notFound("User not found or is already verified.", "Not Found");
            }
            const otpTime = userExists.otpTime;
            const currentTime = new Date();
            const diff = currentTime - otpTime;
            const diffInMinutes = Math.floor(diff / 60000);
            if (diffInMinutes > 15) {
                throw middlewares_1.ErrorHandler.unauthorized("OTP is expired", "Not Authorized");
            }
            if (userExists.otp !== otp) {
                throw middlewares_1.ErrorHandler.unauthorized("OTP is incorrect", "Not Authorized");
            }
            await models_1.UserModel.updateOne({ email: email }, { isVerified: true, status: user_type_1.Status.ACTIVE, otp: null, otpTime: null });
            return res.status(200).json({ message: "OTP Verified" });
        }
        catch (error) {
            return next(error);
        }
    }
    static async resendOtp(req, res, next) {
        const { email } = req.body;
        try {
            if (email === undefined) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify("Email is required"), "Not Acceptable");
            }
            const { error } = await validators_1.AuthValidator.resendOtp(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const userExists = await models_1.UserModel.findOne({ email: email });
            if (!userExists) {
                throw middlewares_1.ErrorHandler.notFound("User not found", "Not Found");
            }
            if (userExists.isVerified) {
                throw middlewares_1.ErrorHandler.conflict("User is already verified", "Conflict");
            }
            if (userExists.status === user_type_1.Status.BLOCKED) {
                throw middlewares_1.ErrorHandler.unauthorized("You are blocked by admin.", "Conflict");
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            await services_1.MailService.sendViaMail(`Your OTP is ${otp}`, "OTP For Verification", email, next);
            await models_1.UserModel.findOneAndUpdate({ email: email }, { otp: otp, otpTime: new Date() });
            return res.status(200).json({ message: "OTP Sent" });
        }
        catch (error) {
            return next(error);
        }
    }
    static async forgotPassMail(req, res, next) {
        const { email } = req.body;
        try {
            if (!email) {
                throw middlewares_1.ErrorHandler.notAcceptable("Email is required to send reset link.", "Not Acceptable");
            }
            const user = await models_1.UserModel.findOne({
                $and: [{ email: email }, { status: user_type_1.Status.ACTIVE }],
            });
            if (!user) {
                throw middlewares_1.ErrorHandler.notFound("User not found", "Not Found");
            }
            const token = services_1.JWTService.generate({ _id: user._id, email: user.email });
            let message = `Please click on this url to reset password http://localhost:3000/reset-pass/pass-reset-token=${token}`;
            await services_1.MailService.sendViaMail(message, "Link for Password Reset", user.email, next);
            return res
                .status(200)
                .json({ message: "Mail to reset your password has been sent." });
        }
        catch (error) {
            return next(error);
        }
    }
    static async updateForgotPassword(req, res, next) {
        const { userId, body } = req;
        try {
            if (!body.password) {
                throw middlewares_1.ErrorHandler.notAcceptable("Password is required to reset password.", "Not Found");
            }
            const hashPassword = helpers_1.HashHelper.generate(body.password);
            await models_1.UserModel.updateOne({ _id: userId }, { password: hashPassword });
            return res.status(200).json({ message: "Password updated successfully" });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map