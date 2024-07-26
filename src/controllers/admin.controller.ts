import { NextFunction, Request, Response } from "express-serve-static-core";
import mongoose, { PaginateOptions, PipelineStage } from "mongoose";
import { ParsedQs } from "qs";
import { ErrorHandler } from "../middlewares";
import { KYCModel, UserModel } from "../models";
import { ChangeStatusRequest, QueryOptions, Role } from "../types/user.type";
import { AdminValidator, UserValidator } from "../validators";

interface IHandleKYC {
  userId: string;
  kycId: string;
  status: string;
}

class AdminController {
  // User
  public static async changeStatus(
    req: Request<object, object, ChangeStatusRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.role !== Role.ADMIN) {
        throw ErrorHandler.unauthorized(
          "You are not allowed here.",
          "Not Authorized",
        );
      }

      const { error } = await UserValidator.changeStatus(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
          JSON.stringify(error.details),
          "Not Acceptable",
        );
      }

      const isValidId = mongoose.Types.ObjectId.isValid(req.body._id);

      if (!isValidId) {
        throw ErrorHandler.notAcceptable(
          "Id format not accepted.",
          "Not Acceptable",
        );
      }

      const userExists = await UserModel.findOne({ _id: req.body._id });

      if (!userExists) {
        throw ErrorHandler.notFound("User not found", "Not Found");
      }

      if (userExists.role === Role.ADMIN) {
        throw ErrorHandler.conflict(
          "Admin cannot update itself",
          "User Conflict",
        );
      }

      await UserModel.findOneAndUpdate(
        { _id: req.body._id },
        { status: req.body.status, isVerified: false, isApproved: false },
        { new: true },
      );

      return res.status(200).json({
        message: "User Status Changed.",
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async handleKyc(
    req: Request<object, object, IHandleKYC>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.role !== Role.ADMIN) {
        throw ErrorHandler.unauthorized(
          "You are not allowed to be here",
          "Not Authorized",
        );
      }

      const { error } = await AdminValidator.handleKyc(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
          JSON.stringify(error.details),
          "Not Acceptable",
        );
      }

      const kycInfo = KYCModel.findOne({
        _id: req.body.kycId,
        userId: req.body.userId,
      });

      if (!kycInfo) {
        throw ErrorHandler.notFound("No Kyc Info found", "Not Found");
      }

      await KYCModel.findOneAndUpdate(
        { _id: req.body.kycId, userId: req.body.userId },
        { kyc_status: req.body.status },
      );

      res.status(200).json({
        message: "Kyc has been handled",
      });
    } catch (err) {
      return next(err);
    }
  }

  public static async getKycRequestUsers(
    req: Request<
      object,
      object,
      object,
      QueryOptions & {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      } & ParsedQs
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.role !== Role.ADMIN) {
        throw ErrorHandler.unauthorized(
          "You are not allowed here!",
          "Not Authorized",
        );
      }

      const {
        page,
        limit,
        orderBy = "createdAt",
        order = 1,
        email,
        firstName,
        lastName,
        phone,
        from,
        to,
      } = req.query;

      const options: PaginateOptions = {
        page: parseInt(String(page) ?? "1", 10),
        limit: parseInt(String(limit) ?? "10", 10),
        sort: { [orderBy]: parseInt(String(order)) ?? -1 },
      };

      const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
      const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
      const emailRegex = email ? new RegExp(email, "i") : null;
      const phoneNumber = phone ? Number(phone) : null;

      const matchCriteria: { $or?: any[]; "userInfo.createdAt"?: any } = {};

      if (from || to) {
        matchCriteria["userInfo.createdAt"] = {};
        if (from) {
          matchCriteria["userInfo.createdAt"].$gte = new Date(from as string);
        }
        if (to) {
          matchCriteria["userInfo.createdAt"].$lte = new Date(to as string);
        }
      }

      if (
        firstNameRegex ||
        lastNameRegex ||
        emailRegex ||
        phoneNumber !== null
      ) {
        matchCriteria.$or = [];
        if (firstNameRegex) {
          matchCriteria.$or.push({
            "userInfo.first_name": { $regex: firstNameRegex },
          });
        }
        if (lastNameRegex) {
          matchCriteria.$or.push({
            "userInfo.last_name": { $regex: lastNameRegex },
          });
        }
        if (emailRegex) {
          matchCriteria.$or.push({ "userInfo.email": { $regex: emailRegex } });
        }
        if (phoneNumber !== null) {
          matchCriteria.$or.push({ "userInfo.phone": phoneNumber });
        }
      }

      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: matchCriteria },
        {
          $project: {
            "userInfo.qr": 0,
            "userInfo.password": 0,
            "userInfo.salt": 0,
            "userInfo.otp": 0,
            "userInfo.otpTime": 0,
          },
        },
      ];

      const userAggregate = KYCModel.aggregate(pipeline);

      const users = await KYCModel.aggregatePaginate(userAggregate, options);

      if (users.docs.length === 0) {
        throw ErrorHandler.notFound("Students not found", "Not Found");
      }

      return res.status(200).json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async getApprovedKycUsers(
    req: Request<
      object,
      object,
      object,
      QueryOptions & {
        firstName: string;
        lastName: string;
        email: string;
        from: string;
        to: string;
      } & ParsedQs
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.role !== Role.ADMIN) {
        throw ErrorHandler.unauthorized(
          "You are not allowed here!",
          "Not Authorized",
        );
      }

      const {
        page,
        limit,
        orderBy = "createdAt",
        order = 1,
        email,
        firstName,
        lastName,
        from,
        to,
      } = req.query;

      const options: PaginateOptions = {
        page: parseInt(String(page) ?? "1", 10),
        limit: parseInt(String(limit) ?? "10", 10),
        sort: { [orderBy]: parseInt(String(order)) ?? -1 },
      };

      const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
      const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
      const emailRegex = email ? new RegExp(email, "i") : null;

      const matchCriteria: {
        $or?: any[];
        role?: {};
        "kycInfo.createdAt"?: any;
      } = {
        role: { $ne: Role.ADMIN },
      };

      if (firstNameRegex || lastNameRegex || emailRegex) {
        matchCriteria.$or = [];
        if (firstNameRegex) {
          matchCriteria.$or.push({ first_name: { $regex: firstNameRegex } });
        }
        if (lastNameRegex) {
          matchCriteria.$or.push({ last_name: { $regex: lastNameRegex } });
        }
        if (emailRegex) {
          matchCriteria.$or.push({ email: { $regex: emailRegex } });
        }
      }

      if (from || to) {
        matchCriteria["kycInfo.createdAt"] = {};
        if (from) {
          matchCriteria["kycInfo.createdAt"].$gte = new Date(from);
        }
        if (to) {
          matchCriteria["kycInfo.createdAt"].$lte = new Date(to);
        }
      }

      const pipeline: PipelineStage[] = [
        { $match: matchCriteria },
        {
          $lookup: {
            from: "kycs",
            localField: "_id",
            foreignField: "userId",
            as: "kycInfo",
          },
        },
        {
          $unwind: {
            path: "$kycInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: { "kycInfo.kyc_status": "APPROVED" },
        },
        {
          $project: {
            qr: 0,
            password: 0,
            salt: 0,
            otp: 0,
            otpTime: 0,
          },
        },
      ];

      const userAggregate = UserModel.aggregate(pipeline);

      const users = await UserModel.aggregatePaginate(userAggregate, options);

      if (users.docs.length === 0) {
        throw ErrorHandler.notFound("Students not found", "Not Found");
      }

      return res.status(200).json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async getAllUsers(
    req: Request<
      object,
      object,
      object,
      QueryOptions & {
        firstName: string;
        lastName: string;
        email: string;
        from: string;
        to: string;
      } & ParsedQs
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.role !== Role.ADMIN) {
        throw ErrorHandler.unauthorized(
          "You are not allowed here!",
          "Not Authorized",
        );
      }

      const {
        page,
        limit,
        orderBy = "createdAt",
        order = 1,
        email,
        firstName,
        lastName,
        from,
        to,
      } = req.query;

      const options: PaginateOptions = {
        page: parseInt(String(page) ?? "1", 10),
        limit: parseInt(String(limit) ?? "10", 10),
        sort: { [orderBy]: parseInt(String(order)) ?? -1 },
      };

      const firstNameRegex = firstName ? new RegExp(firstName, "i") : null;
      const lastNameRegex = lastName ? new RegExp(lastName, "i") : null;
      const emailRegex = email ? new RegExp(email, "i") : null;

      const matchCriteria: {
        $or?: any[];
        role?: {};
        createdAt?: any;
      } = {
        role: { $ne: Role.ADMIN },
      };

      if (firstNameRegex || lastNameRegex || emailRegex) {
        matchCriteria.$or = [];
        if (firstNameRegex) {
          matchCriteria.$or.push({ first_name: { $regex: firstNameRegex } });
        }
        if (lastNameRegex) {
          matchCriteria.$or.push({ last_name: { $regex: lastNameRegex } });
        }
        if (emailRegex) {
          matchCriteria.$or.push({ email: { $regex: emailRegex } });
        }
      }

      if (from || to) {
        matchCriteria.createdAt = {};
        if (from) {
          matchCriteria.createdAt.$gte = new Date(from);
        }
        if (to) {
          matchCriteria.createdAt.$lte = new Date(to);
        }
      }

      const pipeline: PipelineStage[] = [
        { $match: matchCriteria },
        {
          $project: {
            qr: 0,
            password: 0,
            salt: 0,
            otp: 0,
            otpTime: 0,
          },
        },
      ];

      const userAggregate = UserModel.aggregate(pipeline);

      const users = await UserModel.aggregatePaginate(userAggregate, options);

      if (users.docs.length === 0) {
        throw ErrorHandler.notFound("Students not found", "Not Found");
      }

      return res.status(200).json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default AdminController;
