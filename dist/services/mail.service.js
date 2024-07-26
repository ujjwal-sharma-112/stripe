"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = require("twilio");
class MailService {
    static async sendViaMail(message, subject, to, next) {
        try {
            const transporter = nodemailer_1.default.createTransport({
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
                }
                else {
                    console.log(info);
                }
            });
        }
        catch (error) {
            return next(error);
        }
    }
    static async sendViaSMS(message, to, dialing_code, next) {
        try {
            const client = new twilio_1.Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
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
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = MailService;
//# sourceMappingURL=mail.service.js.map