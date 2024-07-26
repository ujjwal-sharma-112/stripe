import { NextFunction } from "express-serve-static-core";
import nodemailer from "nodemailer";
import { Twilio } from "twilio";

class MailService {
  public static async sendViaMail(
    message: string,
    subject: string,
    to: string,
    next: NextFunction,
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: message,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          throw err;
        } else {
          console.log(info);
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async sendViaSMS(
    message: string,
    to: number,
    dialing_code: string,
    next: NextFunction,
  ) {
    try {
      const client = new Twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      client.messages
        .create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+${dialing_code}${to}`,
        })
        .then((message) => console.log(message.sid))
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      return next(error);
    }
  }
}

export default MailService;
