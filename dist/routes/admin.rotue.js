"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const adminRouter = (0, express_1.Router)();
adminRouter.get("/users", middlewares_1.VerifyMiddleware.verify, controllers_1.AdminController.getAllUsers);
adminRouter.get("/kyc-request-users", middlewares_1.VerifyMiddleware.verify, controllers_1.AdminController.getKycRequestUsers);
adminRouter.get("/approved-kyc-users", middlewares_1.VerifyMiddleware.verify, controllers_1.AdminController.getApprovedKycUsers);
adminRouter.put("/status", middlewares_1.VerifyMiddleware.verify, controllers_1.AdminController.changeStatus);
adminRouter.put("/handle-kyc", middlewares_1.VerifyMiddleware.verify, controllers_1.AdminController.handleKyc);
exports.default = adminRouter;
//# sourceMappingURL=admin.rotue.js.map