"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const models_1 = require("../models");
const middlewares_1 = require("../middlewares");
const services_1 = require("../services");
const mongoose_1 = __importDefault(require("mongoose"));
const validators_1 = require("../validators");
const cloudinary_1 = require("cloudinary");
const stripe_1 = __importDefault(require("stripe"));
class UserController {
    static async enable_2fa(req, res, next) {
        try {
            const { userId, enabled_2fa } = req;
            if (!enabled_2fa) {
                throw middlewares_1.ErrorHandler.conflict("2FA Already enabled", "2FA Conflict");
            }
            const temp_secret = speakeasy_1.default.generateSecret({
                name: "Test 2fa",
            });
            const qr = await qrcode_1.default.toDataURL(temp_secret.otpauth_url.toString());
            await models_1.UserModel.findOneAndUpdate({ _id: userId }, { temp_secret: temp_secret });
            return res.status(200).json({
                message: "2fa enabled",
                qr: qr,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async disable_2fa(req, res, next) {
        try {
            const { token } = req.body;
            const { userId, perm_secret } = req;
            const { error } = await validators_1.UserValidator.disable2fa(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const verified = speakeasy_1.default.totp.verify({
                secret: perm_secret.base32,
                encoding: "base32",
                token,
            });
            if (verified) {
                await models_1.UserModel.findOneAndUpdate({ _id: userId }, {
                    enabled_2fa: false,
                    temp_secret: null,
                    perm_secret: null,
                });
                return res.status(200).json({
                    message: "2Fa has been disabled",
                });
            }
            else {
                throw middlewares_1.ErrorHandler.unauthorized("Something went wrong while authenticating 2fa", "Not Authorized");
            }
        }
        catch (err) {
            return next(err);
        }
    }
    static async verify_2fa(req, res, next) {
        try {
            const { token, userId } = req.body;
            const { error } = await validators_1.UserValidator.verifyOtp(req.body);
            if (error) {
                throw middlewares_1.ErrorHandler.notAcceptable(JSON.stringify(error.details), "Not Acceptable");
            }
            const isValidId = mongoose_1.default.Types.ObjectId.isValid(userId);
            if (!isValidId) {
                throw middlewares_1.ErrorHandler.notAcceptable("Please provide a valid user id", "Not Acceptable");
            }
            const user = await models_1.UserModel.findOne({ _id: userId });
            if (!user) {
                throw middlewares_1.ErrorHandler.notFound("User not Found with userId", "Not Found");
            }
            if (user.enabled_2fa) {
                const { base32: secret } = user.perm_secret;
                const verified = speakeasy_1.default.totp.verify({
                    secret,
                    encoding: "base32",
                    token,
                });
                if (verified) {
                    const jwtToken = services_1.JWTService.generate({ _id: userId });
                    return res.status(200).json({
                        message: "User Verified with 2fa",
                        token: jwtToken,
                    });
                }
                else {
                    throw middlewares_1.ErrorHandler.unauthorized("Something went wrong while verifying user", "Not authorized");
                }
            }
            if (!user.enabled_2fa &&
                user.perm_secret === null &&
                user.temp_secret === null) {
                throw middlewares_1.ErrorHandler.unauthorized("Your 2fa is disabled", "Not authorized");
            }
            const { base32: secret } = user.temp_secret;
            const verified = speakeasy_1.default.totp.verify({
                secret,
                encoding: "base32",
                token,
            });
            if (verified) {
                await models_1.UserModel.findOneAndUpdate({ _id: userId }, {
                    enabled_2fa: true,
                    temp_secret: null,
                    perm_secret: user.temp_secret,
                });
                const jwtToken = services_1.JWTService.generate({ _id: userId });
                return res.status(200).json({
                    message: "User Verified with 2fa",
                    token: jwtToken,
                });
            }
            else {
                throw middlewares_1.ErrorHandler.unauthorized("Something went wrong while authenticating 2fa", "Not Authorized");
            }
        }
        catch (err) {
            return next(err);
        }
    }
    static async requestKYC(req, res, next) {
        try {
            const uploadPromises = [];
            const kycInfo = await models_1.KYCModel.findOne({ userId: req.userId });
            if (kycInfo && kycInfo.kyc_status === "APPROVED") {
                throw middlewares_1.ErrorHandler.notAcceptable("You have already applied for KYC or KYC Request has already been approved", "Not Found");
            }
            if (kycInfo && kycInfo.kyc_status === "PENDING") {
                throw middlewares_1.ErrorHandler.notAcceptable("We already have your kyc request and will get back to you shortly", "Not Found");
            }
            if (req.files) {
                for (const file of Object.values(req.files)) {
                    file.map((f) => uploadPromises.push(cloudinary_1.v2.uploader.upload(f.path, {
                        folder: `kyc/documents/${req.userId}`,
                    })));
                }
            }
            const uploadResults = await Promise.all(uploadPromises);
            const kycData = {
                userId: req.userId,
                address: {
                    house_no: req.body.house_no,
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                },
                pan_card: null,
                adhaar_card: null,
                passport: null,
                drivers_id: null,
                image: null,
            };
            uploadResults.forEach((uR) => {
                switch (uR.original_filename.split("-")[0]) {
                    case "pan_card":
                        kycData.pan_card = uR.secure_url || null;
                        break;
                    case "adhaar_card":
                        kycData.adhaar_card = uR.secure_url || null;
                        break;
                    case "passport":
                        kycData.passport = uR.secure_url || null;
                        break;
                    case "drivers_id":
                        kycData.drivers_id = uR.secure_url || null;
                        break;
                    case "image":
                        kycData.image = uR.secure_url || null;
                        break;
                }
            });
            await models_1.KYCModel.create(kycData);
            res.status(201).json({
                message: "Your KYC request has been recieved. We will get back to you shortly.",
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async createCheckoutSession(req, res, next) {
        try {
            const { plan } = req.body;
            const { isVerified, userId } = req;
            if (!isVerified) {
                throw middlewares_1.ErrorHandler.unauthorized("You are not allowed to be here", "Not Authorized");
            }
            const amount = Number(plan.price) * 100;
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET);
            const response = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: plan.name,
                            },
                            unit_amount: amount,
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    plan_id: plan.id,
                    plan: plan.name,
                    credits: plan.credits,
                    buyer_id: userId.toString(),
                },
                mode: "payment",
                success_url: "http://localhost:5173/success",
                cancel_url: "http://localhost:5173/cancel",
            });
            return res.status(200).json({
                id: response.id,
            });
        }
        catch (err) {
            return next(err);
        }
    }
    static async paymentFullfilment(req, res, next) {
        try {
            const sig = req.headers["stripe-signature"];
            let event;
            try {
                event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
            }
            catch (err) {
                res.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }
            switch (event.type) {
                case "charge.updated":
                    const { id, metadata, amount_captured } = event.data.object;
                    await models_1.TransactionModel.create({
                        stripeId: id,
                        amount: amount_captured ? amount_captured / 100 : 0,
                        plan: (metadata === null || metadata === void 0 ? void 0 : metadata.plan) || "",
                        credits: Number(metadata === null || metadata === void 0 ? void 0 : metadata.credits) || 0,
                        buyerId: (metadata === null || metadata === void 0 ? void 0 : metadata.buyerId) || "",
                    });
                    await models_1.UserModel.updateOne({ _id: metadata === null || metadata === void 0 ? void 0 : metadata.buyerId }, {
                        planId: metadata === null || metadata === void 0 ? void 0 : metadata.plan_id,
                        $inc: { creditBalance: Number(metadata === null || metadata === void 0 ? void 0 : metadata.credits) },
                    });
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
            res.status(200).json({
                message: "Payment Successfull",
            });
        }
        catch (err) {
            return next(err);
        }
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map