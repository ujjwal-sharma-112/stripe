import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },
    user_name: {
      type: String,
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    address: {
      type: {
        country: {
          type: String,
        },
        state: {
          type: String,
        },
        city: {
          type: String,
        },
      },
    },
    dialing_code: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
    otpTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'BLOCKED', 'DELETED'],
      default: 'PENDING',
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    qr: {
      type: String,
    },
    planId: {
      type: Number,
      default: 1,
    },
    creditBalance: {
      type: Number,
      default: 20,
    },
    enabled_2fa: {
      type: Boolean,
      default: false,
    },
    perm_secret: {
      type: Object,
      default: null,
    },
    temp_secret: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.plugin(mongooseAggregatePaginate);

interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  email: string;
  phone: number;
  user_name: string;
  password: string;
  salt: string;
  address: {
    country: string;
    state: string;
    city: string;
  };
  dialing_code: string;
  isVerified: boolean;
  isApproved: boolean;
  status: string;
  role: string;
  qr: string;
  otp: number;
  otpTime: Date;
  temp_secret: {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url: string;
  };
  perm_secret: {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url: string;
  };
  creditBalance: number;
  planId: number;
  enabled_2fa: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserModel = mongoose.model<
  UserDocument,
  mongoose.AggregatePaginateModel<UserDocument>
>('users', userSchema);

export default UserModel;
