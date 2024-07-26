"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const middlewares_1 = require("../middlewares");
class StaticService {
    static async createDefaultStaticData() {
        try {
            const staticData = await models_1.StaticModel.findOne();
            if (staticData) {
                throw middlewares_1.ErrorHandler.conflict("Static data already exists", "Conflict");
            }
            await models_1.FaqModel.create({
                ques: "What is the course duration?",
                sol: "The course duration is 6 months",
            });
            await models_1.StaticModel.create({
                about_us: {
                    title: "About Us",
                    content: "This is the about us section",
                },
                privacy_policy: {
                    title: "Privacy Policy",
                    content: "This is the privacy policy section",
                },
                terms_and_conditions: {
                    title: "Terms & Conditions",
                    content: "This is the terms and conditions section",
                },
            });
            console.log("Default static data created successfully");
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = StaticService;
//# sourceMappingURL=static.service.js.map