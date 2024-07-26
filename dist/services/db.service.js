"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class DbService {
    static async connect() {
        try {
            await mongoose_1.default.connect(this.dbUri);
            console.log("Db Connected.");
        }
        catch (error) {
            console.log(error);
        }
    }
}
DbService.dbUri = process.env.DB_URI || "";
exports.default = DbService;
//# sourceMappingURL=db.service.js.map