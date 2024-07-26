import {NextFunction, Request, Response} from "express-serve-static-core";
import {ErrorHandler} from ".";
import {JWTService} from "../services";
import {UserModel} from "../models";
import {Status, TokenResponse} from "../types/user.type";

class VerifyMiddleware {
  static async verify(req: Request, __: Response, next: NextFunction) {
    try {
      const token = req.headers["authorization"];

      if (!token) {
        throw ErrorHandler.notFound(
            "Token is required to access this route",
            "Not Found",
        );
      }

      const decoded = JWTService.decode(token) as TokenResponse;

      const userExists = await UserModel.findOne({ _id: decoded._id });

      if (!userExists) {
        throw ErrorHandler.notFound("User not Found", "Not Found");
      }

      if (!userExists.isVerified) {
        throw ErrorHandler.unauthorized(
            "Please verify before continuing.",
            "Not Authorized",
        );
      }

      if (userExists.status !== Status.ACTIVE) {
        throw ErrorHandler.unauthorized(
            "You are not allowed to access this route",
            "Not Authorized",
        );
      }

      req.userId = userExists._id;
      req.email = userExists.email;
      req.role = userExists.role;
      req.temp_secret = userExists.temp_secret;
      req.perm_secret = userExists.perm_secret;
      req.isVerified = userExists.isVerified;
      req.enabled_2fa = userExists.enabled_2fa;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const err = ErrorHandler.unauthorized(
          error.message,
          "TokenExpiredError",
        );
        next(err);
      } else if (error.name === "JsonWebTokenError") {
        const err = ErrorHandler.unauthorized(
          error.message,
          "JsonWebTokenError",
        );
        next(err);
      }
      next(error);
    }
  }
}

export default VerifyMiddleware;
