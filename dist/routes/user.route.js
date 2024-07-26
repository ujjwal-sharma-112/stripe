"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const multer_middleware_1 = __importDefault(require("../middlewares/multer.middleware"));
const userRouter = (0, express_1.Router)();
userRouter.put("/enable-2fa", middlewares_1.VerifyMiddleware.verify, controllers_1.UserController.enable_2fa);
userRouter.put("/disable-2fa", middlewares_1.VerifyMiddleware.verify, controllers_1.UserController.disable_2fa);
userRouter.post("/verify-2fa", controllers_1.UserController.verify_2fa);
userRouter.post("/request-kyc", [
    middlewares_1.VerifyMiddleware.verify,
    multer_middleware_1.default.fields([
        {
            name: "pan_card",
            maxCount: 1,
        },
        {
            name: "adhaar_card",
            maxCount: 1,
        },
        {
            name: "passport",
            maxCount: 1,
        },
        {
            name: "drivers_id",
            maxCount: 1,
        },
        {
            name: "image",
            maxCount: 1,
        },
    ]),
], controllers_1.UserController.requestKYC);
userRouter.post("/create-checkout-session", middlewares_1.VerifyMiddleware.verify, controllers_1.UserController.createCheckoutSession);
userRouter.post("/webhook/stripe", controllers_1.UserController.paymentFullfilment);
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map