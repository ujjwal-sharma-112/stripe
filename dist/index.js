"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes = __importStar(require("./routes"));
const services = __importStar(require("./services"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const controllers_1 = require("./controllers");
async function main() {
    dotenv_1.default.config();
    const PORT = process.env.PORT || 3030;
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    services.DbService.connect().then(() => {
        services.AdminService.create();
        services.StaticService.createDefaultStaticData();
    });
    app.post("/webhook/stripe", controllers_1.UserController.paymentFullfilment);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get("/health", (__, res) => {
        res.send("Server Healthy");
    });
    app.use("/api/v1/auth", routes.AuthRoutes);
    app.use("/api/v1/admin", routes.AdminRoutes);
    app.use("/api/v1/user", routes.UserRoutes);
    app.use((error, _req, res, _next) => {
        const { errorType, message, statusCode, name } = error;
        if (statusCode === undefined) {
            res.status(500).json({
                name: name,
                statusCode: 500,
                errorType: "InternalServerError",
                message: error,
            });
        }
        res.status(statusCode).json({
            name: name,
            statusCode: statusCode,
            errorType: errorType,
            message: message,
        });
    });
    const swaggerDocument = yamljs_1.default.load("swagger.yaml");
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    app.listen(PORT, () => {
        console.log(`SERVER UP AND RUNNING ON URL: http://localhost:${PORT}/api/v1`);
    });
}
main().catch((err) => {
    console.log("Something went horribly wrong.", err);
});
//# sourceMappingURL=index.js.map