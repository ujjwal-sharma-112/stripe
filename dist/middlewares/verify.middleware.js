"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const services_1 = require("../services");
const models_1 = require("../models");
const user_type_1 = require("../types/user.type");
class VerifyMiddleware {
    static async verify(req, __, next) {
        try {
            const token = req.headers["authorization"];
            if (!token) {
                throw _1.ErrorHandler.notFound("Token is required to access this route", "Not Found");
            }
            const decoded = services_1.JWTService.decode(token);
            const userExists = await models_1.UserModel.findOne({ _id: decoded._id });
            if (!userExists) {
                throw _1.ErrorHandler.notFound("User not Found", "Not Found");
            }
            if (!userExists.isVerified) {
                throw _1.ErrorHandler.unauthorized("Please verify before continuing.", "Not Authorized");
            }
            if (userExists.status !== user_type_1.Status.ACTIVE) {
                throw _1.ErrorHandler.unauthorized("You are not allowed to access this route", "Not Authorized");
            }
            req.userId = userExists._id;
            req.email = userExists.email;
            req.role = userExists.role;
            req.temp_secret = userExists.temp_secret;
            req.perm_secret = userExists.perm_secret;
            req.isVerified = userExists.isVerified;
            req.enabled_2fa = userExists.enabled_2fa;
            next();
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                const err = _1.ErrorHandler.unauthorized(error.message, "TokenExpiredError");
                next(err);
            }
            else if (error.name === "JsonWebTokenError") {
                const err = _1.ErrorHandler.unauthorized(error.message, "JsonWebTokenError");
                next(err);
            }
            next(error);
        }
    }
}
exports.default = VerifyMiddleware;
//# sourceMappingURL=verify.middleware.js.map