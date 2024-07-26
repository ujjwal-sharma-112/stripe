import Express from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { ErrorHandler } from "./middlewares";
import * as routes from "./routes";
import * as services from "./services";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";
import dotenv from "dotenv";
import { UserController } from "./controllers";

async function main() {
  dotenv.config();

  // VARIABLES
  const PORT = process.env.PORT || 3030;

  // Instances
  const app = Express();

  app.use(
    cors({
      origin: "*",
    }),
  );

  // DB SERVICE
  services.DbService.connect().then(() => {
    services.AdminService.create();
    services.StaticService.createDefaultStaticData();
  });

  // WEBHOOK
  app.post("/webhook/stripe", UserController.paymentFullfilment);

  // Middlewares
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));

  app.get("/health", (__, res) => {
    res.send("Server Healthy");
  });

  // Routes
  app.use("/api/v1/auth", routes.AuthRoutes);
  app.use("/api/v1/admin", routes.AdminRoutes);
  app.use("/api/v1/user", routes.UserRoutes);

  // Global ErrorHandler
  app.use(
    (
      error: ErrorHandler,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
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
    },
  );

  const swaggerDocument = YAML.load("swagger.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(PORT, () => {
    console.log(
      `SERVER UP AND RUNNING ON URL: http://localhost:${PORT}/api/v1`,
    );
  });
}

main().catch((err) => {
  console.log("Something went horribly wrong.", err);
});
