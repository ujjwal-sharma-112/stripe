"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_type_1 = require("../types/user.type");
const models_1 = require("../models");
const middlewares_1 = require("../middlewares");
const helpers_1 = require("../helpers");
class AdminService {
    static async create() {
        try {
            const admin = await models_1.UserModel.findOne({ role: user_type_1.Role.ADMIN });
            if (admin) {
                throw middlewares_1.ErrorHandler.conflict("Admin Already Exists.", "User Conflict");
            }
            const { hash, salt } = helpers_1.HashHelper.generate("admin");
            await models_1.UserModel.create({
                first_name: "Admin ",
                last_name: "of Game Node",
                user_name: "admin123",
                email: "ujjwalsharma11290@gmail.com",
                password: hash,
                salt: salt,
                phone: 1234567890,
                dialing_code: 91,
                address: {
                    country: "India",
                    state: "Uttar Pradesh",
                    city: "Hapur",
                },
                department: null,
                role: user_type_1.Role.ADMIN,
                isVerified: true,
                isApproved: true,
                status: user_type_1.Status.ACTIVE,
                courses: [],
            });
            console.log("Admin Created Successfully.");
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = AdminService;
//# sourceMappingURL=admin.service.js.map