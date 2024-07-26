import { NextFunction, Request, Response } from "express-serve-static-core";
import speakEasy from "speakeasy";
import qrcode from "qrcode";
import { KYCModel, UserModel, TransactionModel } from "../models";
import { ErrorHandler } from "../middlewares";
import { JWTService } from "../services";
import mongoose from "mongoose";
import { UserValidator } from "../validators";
import { v2 as cloudinary } from "cloudinary";
import { KYCData, Role } from "../types/user.type";
import Stripe from "stripe";
import { resolve } from "node:path/win32";

interface CloudinaryUploadResult {
  secure_url: string;
  original_filename: string;
}

class UserController {
  public static async enable_2fa(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { userId, enabled_2fa } = req;

      if (!enabled_2fa) {
        throw ErrorHandler.conflict("2FA Already enabled", "2FA Conflict");
      }

      const temp_secret = speakEasy.generateSecret({
        name: "Test 2fa",
      });

      const qr = await qrcode.toDataURL(temp_secret.otpauth_url!.toString());

      await UserModel.findOneAndUpdate(
        { _id: userId },
        { temp_secret: temp_secret },
      );

      return res.status(200).json({
        message: "2fa enabled",
        qr: qr,
      });
    } catch (err) {
      return next(err);
    }
  }

  public static async disable_2fa(
    req: Request<object, object, { token: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token } = req.body;
      const { userId, perm_secret } = req;

      const { error } = await UserValidator.disable2fa(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
          JSON.stringify(error.details),
          "Not Acceptable",
        );
      }

      const verified = speakEasy.totp.verify({
        secret: perm_secret!.base32,
        encoding: "base32",
        token,
      });

      if (verified) {
        await UserModel.findOneAndUpdate(
          { _id: userId },
          {
            enabled_2fa: false,
            temp_secret: null,
            perm_secret: null,
          },
        );

        return res.status(200).json({
          message: "2Fa has been disabled",
        });
      } else {
        throw ErrorHandler.unauthorized(
          "Something went wrong while authenticating 2fa",
          "Not Authorized",
        );
      }
    } catch (err) {
      return next(err);
    }
  }

  public static async verify_2fa(
    req: Request<object, object, { token: string; userId: string }>,
    res: Response<{ message: string; token: string }>,
    next: NextFunction,
  ) {
    try {
      const { token, userId } = req.body;

      const { error } = await UserValidator.verifyOtp(req.body);

      if (error) {
        throw ErrorHandler.notAcceptable(
          JSON.stringify(error.details),
          "Not Acceptable",
        );
      }

      const isValidId = mongoose.Types.ObjectId.isValid(userId);

      if (!isValidId) {
        throw ErrorHandler.notAcceptable(
          "Please provide a valid user id",
          "Not Acceptable",
        );
      }

      const user = await UserModel.findOne({ _id: userId });

      if (!user) {
        throw ErrorHandler.notFound("User not Found with userId", "Not Found");
      }

      if (user.enabled_2fa) {
        const { base32: secret } = user.perm_secret;

        const verified = speakEasy.totp.verify({
          secret,
          encoding: "base32",
          token,
        });

        if (verified) {
          const jwtToken = JWTService.generate({ _id: userId });

          return res.status(200).json({
            message: "User Verified with 2fa",
            token: jwtToken,
          });
        } else {
          throw ErrorHandler.unauthorized(
            "Something went wrong while verifying user",
            "Not authorized",
          );
        }
      }

      if (
        !user.enabled_2fa &&
        user.perm_secret === null &&
        user.temp_secret === null
      ) {
        throw ErrorHandler.unauthorized(
          "Your 2fa is disabled",
          "Not authorized",
        );
      }

      const { base32: secret } = user.temp_secret;

      const verified = speakEasy.totp.verify({
        secret,
        encoding: "base32",
        token,
      });

      if (verified) {
        await UserModel.findOneAndUpdate(
          { _id: userId },
          {
            enabled_2fa: true,
            temp_secret: null,
            perm_secret: user!.temp_secret,
          },
        );

        const jwtToken = JWTService.generate({ _id: userId });

        return res.status(200).json({
          message: "User Verified with 2fa",
          token: jwtToken,
        });
      } else {
        throw ErrorHandler.unauthorized(
          "Something went wrong while authenticating 2fa",
          "Not Authorized",
        );
      }
    } catch (err) {
      return next(err);
    }
  }

  public static async requestKYC(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const uploadPromises: Promise<CloudinaryUploadResult>[] = [];

      const kycInfo = await KYCModel.findOne({ userId: req.userId });

      if (kycInfo && kycInfo.kyc_status === "APPROVED") {
        throw ErrorHandler.notAcceptable(
          "You have already applied for KYC or KYC Request has already been approved",
          "Not Found",
        );
      }

      if (kycInfo && kycInfo.kyc_status === "PENDING") {
        throw ErrorHandler.notAcceptable(
          "We already have your kyc request and will get back to you shortly",
          "Not Found",
        );
      }

      if (req.files) {
        for (const file of Object.values(req.files)) {
          file.map((f: Express.Multer.File) =>
            uploadPromises.push(
              cloudinary.uploader.upload(f.path, {
                folder: `kyc/documents/${req.userId}`,
              }),
            ),
          );
        }
      }

      const uploadResults = await Promise.all(uploadPromises);

      const kycData: KYCData = {
        userId: req.userId,
        address: {
          house_no: req.body.house_no,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
        },
        pan_card: null,
        adhaar_card: null,
        passport: null,
        drivers_id: null,
        image: null,
      };

      uploadResults.forEach((uR) => {
        switch (uR.original_filename.split("-")[0]) {
          case "pan_card":
            kycData.pan_card = uR.secure_url || null;
            break;
          case "adhaar_card":
            kycData.adhaar_card = uR.secure_url || null;
            break;
          case "passport":
            kycData.passport = uR.secure_url || null;
            break;
          case "drivers_id":
            kycData.drivers_id = uR.secure_url || null;
            break;
          case "image":
            kycData.image = uR.secure_url || null;
            break;
        }
      });

      await KYCModel.create(kycData);

      res.status(201).json({
        message:
          "Your KYC request has been recieved. We will get back to you shortly.",
      });
    } catch (err) {
      return next(err);
    }
  }

  public static async createCheckoutSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { plan } = req.body;
      const { isVerified, userId } = req;

      if (!isVerified) {
        throw ErrorHandler.unauthorized(
          "You are not allowed to be here",
          "Not Authorized",
        );
      }

      const amount = Number(plan.price) * 100;

      const stripe = new Stripe(process.env.STRIPE_SECRET!);

      const response = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: plan.name,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          plan_id: plan.id,
          plan: plan.name,
          credits: plan.credits,
          buyer_id: userId.toString(),
        },
        mode: "payment",
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel",
      });

      return res.status(200).json({
        id: response.id,
      });
    } catch (err) {
      return next(err);
    }
  }

  public static async paymentFullfilment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const sig = req.headers["stripe-signature"]!;

      let event: Stripe.Event;

      try {
        event = Stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.WEBHOOK_SECRET!,
        );
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        case "charge.updated":
          const { id, metadata, amount_captured } = event.data.object;

          await TransactionModel.create({
            stripeId: id,
            amount: amount_captured ? amount_captured / 100 : 0,
            plan: metadata?.plan || "",
            credits: Number(metadata?.credits) || 0,
            buyerId: metadata?.buyerId || "",
          });

          await UserModel.updateOne(
            { _id: metadata?.buyerId },
            {
              planId: metadata?.plan_id!,
              $inc: { creditBalance: metadata?.credits },
            },
          );

          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.status(200).json({
        message: "Payment Successfull",
      });
    } catch (err) {
      return next(err);
    }
  }
}

export default UserController;
