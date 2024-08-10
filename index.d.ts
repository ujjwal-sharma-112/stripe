import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectId;
      role: string;
      email: string;
      temp_secret?: {
        ascii: string;
        hex: string;
        base32: string;
        otpauth_url: string;
      };
      perm_secret?: {
        ascii: string;
        hex: string;
        base32: string;
        otpauth_url: string;
      };
      isVerified?: boolean;
      enabled_2fa?: boolean;
    }
  }
}
