"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: function (req, _file, cb) {
        const userId = req.userId;
        const userDir = path_1.default.join("documents/", userId.toString());
        fs_1.default.mkdirSync(userDir, { recursive: true });
        cb(null, userDir);
    },
    filename: function (_req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
//# sourceMappingURL=multer.middleware.js.map