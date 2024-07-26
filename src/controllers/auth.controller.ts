import {NextFunction, Request, Response} from "express-serve-static-core";
import {ErrorHandler} from "../middlewares";
import {UserModel} from "../models";
import {LoginRequestDTO, Status, UserCreateRequest, VerifyOtp} from "../types/user.type";
import {AuthValidator} from "../validators";
import {JWTService, MailService} from "../services";
import {HashHelper} from "../helpers";
import QRCode from "qrcode";

class AuthController {
  public static async signUp(
    req: Request<object, object, UserCreateRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        email,
        user_name,
        first_name,
        last_name,
        password,
        phone,
        dialing_code,
        address,
      } = req.body;
      const query = {
        $or: [{ email: email }, { phone: phone }, { user_name: user_name }],
      };

      const { error } = await AuthValidator.signUp(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
            JSON.stringify(error.details),
            error.name,
        );
      }

      const userExists = await UserModel.findOne(query);

      if (userExists && userExists.status === Status.DELETED) {
        if (
          userExists.email === email &&
          userExists.phone === phone &&
          userExists.user_name === user_name
        ) {
          const otp = Math.floor(100000 + Math.random() * 900000);

          await UserModel.findOneAndUpdate(
            { email: email, phone: phone, user_name: user_name },
            { otp: otp, otpTime: new Date() },
          );

          await MailService.sendViaMail(
            `We saw your account was deleted. If this is really you. You can reactivate you account by verifying the otp we just sent you. Your otp for verification is: ${otp}`,
            "Otp for Verification",
            email,
            next,
          );

          return res.status(201).json({
            message: "Your account is deleted. Please check your email",
          });
        }
      } else if (!userExists) {
        const otp = Math.floor(100000 + Math.random() * 900000);

        await MailService.sendViaMail(
          `Your otp for verification is: ${otp}`,
          "Otp for Verification",
          email,
          next,
        );

        const { hash, salt } = HashHelper.generate(password);

        const qr = await QRCode.toDataURL(email);

        const user = await UserModel.create({
          first_name: first_name,
          last_name: last_name,
          user_name: user_name,
          email: email,
          password: hash,
          salt: salt,
          phone: phone,
          dialing_code: dialing_code,
          address: {
            city: address.city,
            country: address.country,
            state: address.state,
          },
          qr: qr,
          otp: otp,
          otpTime: new Date(),
        });

        const result = {
          email: user!.email,
        };

        return res.status(201).json({
          message: "User Created Successfully. Please verify before continue.",
          result,
        });
      } else {
        if (userExists.email === email) {
          throw ErrorHandler.conflict(
              "User with provided Email already exist",
              "User Conflict",
          );
        }

        if (userExists.phone === phone) {
          throw ErrorHandler.conflict(
              "User with provided Phone already exist",
              "User Conflict",
          );
        }

        if (userExists.user_name === user_name) {
          throw ErrorHandler.conflict(
              "User with provided user_name already exist",
              "User Conflict",
          );
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  public static async login(
    req: Request<object, object, LoginRequestDTO>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, username, phone, password } = req.body;

      const query = {
        $and: [
          {
            $or: [{ email: email }, { user_name: username }, { phone: phone }],
          },
          { status: { $ne: Status.DELETED } },
        ],
      };

      const { error } = await AuthValidator.login(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
            JSON.stringify(error.details),
            "Not Acceptable",
        );
      }

      const userExists = await UserModel.findOne(query);

      if (!userExists) {
        throw ErrorHandler.notFound("User not Found", "Not Found");
      }

      if (userExists.isVerified === false) {
        throw ErrorHandler.unauthorized(
            "Please verify your account first.",
            "Not Authorized",
        );
      }

      if (userExists.status === Status.BLOCKED) {
        throw ErrorHandler.unauthorized(
            "You are blocked by admin",
            "Not Authorized",
        );
      }

      const isPassValid = HashHelper.compare(
        password,
        userExists.password,
        userExists.salt,
      );

      if (!isPassValid) {
        throw ErrorHandler.unauthorized(
            "Password is not correct.",
            "Not Authorized",
        );
      }

      if (userExists.enabled_2fa) {
        return res.status(200).json({
          message: "Please verify 2fa before continuing",
          userId: userExists._id,
        });
      } else {
        const token = JWTService.generate({
          _id: userExists._id,
          email: userExists.email,
        });
        return res.status(200).json({
          message: "User Logged In.",
          token: token,
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  public static async verifyOtp(
    req: Request<object, object, VerifyOtp>,
    res: Response,
    next: NextFunction,
  ) {
    const { email, otp } = req.body;

    try {
      const { error } = await AuthValidator.verifyOtp(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
            JSON.stringify(error.details),
            "Not Acceptable",
        );
      }

      const userExists = await UserModel.findOne({
        $and: [
          { email: email },
          { status: Status.PENDING },
          { isVerified: false },
        ],
      });

      if (!userExists) {
        throw ErrorHandler.notFound(
            "User not found or is already verified.",
            "Not Found",
        );
      }

      // Checking if otp created time is greater than 3 minutes
      const otpTime: any = userExists.otpTime;
      const currentTime: any = new Date();
      const diff = currentTime - otpTime;
      const diffInMinutes = Math.floor(diff / 60000);

      if (diffInMinutes > 15) {
        throw ErrorHandler.unauthorized(
            "OTP is expired",
            "Not Authorized",
        );
      }

      if (userExists.otp !== otp) {
        throw ErrorHandler.unauthorized(
            "OTP is incorrect",
            "Not Authorized",
        );
      }

      await UserModel.updateOne(
        { email: email },
        { isVerified: true, status: Status.ACTIVE, otp: null, otpTime: null },
      );

      return res.status(200).json({ message: "OTP Verified" });
    } catch (error) {
      return next(error);
    }
  }

  public static async resendOtp(
    req: Request<object, object, { email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { email } = req.body;

    try {
      if (email === undefined) {
        throw ErrorHandler.notAcceptable(
            JSON.stringify("Email is required"),
            "Not Acceptable",
        );
      }

      const { error } = await AuthValidator.resendOtp(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
            JSON.stringify(error.details),
            "Not Acceptable",
        );
      }

      const userExists = await UserModel.findOne({ email: email });

      if (!userExists) {
        throw ErrorHandler.notFound("User not found", "Not Found");
      }

      if (userExists.isVerified) {
        throw ErrorHandler.conflict(
            "User is already verified",
            "Conflict",
        );
      }

      if (userExists.status === Status.BLOCKED) {
        throw ErrorHandler.unauthorized(
            "You are blocked by admin.",
            "Conflict",
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);

      await MailService.sendViaMail(
        `Your OTP is ${otp}`,
        "OTP For Verification",
        email,
        next,
      );

      await UserModel.findOneAndUpdate({email: email}, {otp: otp, otpTime: new Date()})

      return res.status(200).json({ message: "OTP Sent" });
    } catch (error) {
      return next(error);
    }
  }

  public static async forgotPassMail(
    req: Request<object, object, { email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { email } = req.body;

    try {
      if (!email) {
        throw ErrorHandler.notAcceptable(
            "Email is required to send reset link.",
            "Not Acceptable",
        );
      }

      const user = await UserModel.findOne({
        $and: [{ email: email }, { status: Status.ACTIVE }],
      });

      if (!user) {
        throw ErrorHandler.notFound("User not found", "Not Found");
      }

      const token = JWTService.generate({ _id: user._id, email: user.email });

      let message = `Please click on this url to reset password http://localhost:3000/reset-pass/pass-reset-token=${token}`;

      await MailService.sendViaMail(
        message,
        "Link for Password Reset",
        user.email,
        next,
      );

      return res
        .status(200)
        .json({ message: "Mail to reset your password has been sent." });
    } catch (error) {
      return next(error);
    }
  }

  public static async updateForgotPassword(
    req: Request<object, object, { password: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { userId, body } = req;

    try {
      if (!body.password) {
        throw ErrorHandler.notAcceptable(
            "Password is required to reset password.",
            "Not Found",
        );
      }

      const hashPassword = HashHelper.generate(body.password);

      await UserModel.updateOne({ _id: userId }, { password: hashPassword });

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      return next(error);
    }
  }
}

export default AuthController;
