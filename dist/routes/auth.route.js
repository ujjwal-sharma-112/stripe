"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const authRouter = (0, express_1.Router)();
authRouter.post("/sign-up", controllers_1.AuthController.signUp);
authRouter.post("/login", controllers_1.AuthController.login);
authRouter.post("/verify-otp", controllers_1.AuthController.verifyOtp);
authRouter.post("/resend-otp", controllers_1.AuthController.resendOtp);
authRouter.post("/forgot-password", controllers_1.AuthController.forgotPassMail);
authRouter.post("/reset-password", middlewares_1.VerifyMiddleware.verify, controllers_1.AuthController.updateForgotPassword);
exports.default = authRouter;
//# sourceMappingURL=auth.route.js.map