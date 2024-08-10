import mongoose from 'mongoose';

export type User = {
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
  status: string;
  role: Role;
  qr: string;
  createdAt: string;
  updatedAt: string;
};

export type UserCreateRequest = Omit<
  User,
  | 'isVerified'
  | 'status'
  | 'role'
  | 'qr'
  | 'createdAt'
  | 'updatedAt'
  | '_id'
  | 'salt'
>;
export type UpdateUserRequest = Partial<
  Omit<
    User,
    | 'dialing_code'
    | 'department'
    | 'isVerified'
    | 'status'
    | 'role'
    | 'qr'
    | 'createdAt'
    | 'updatedAt'
    | 'password'
    | 'courses'
    | 'isApproved'
    | '_id'
  >
>;
export type TokenResponse = Pick<User, '_id' | 'email'>;
export type LoginRequestDTO = {
  email: string;
  username: string;
  phone: number;
  password: string;
};
export type ChangeStatusRequest = Pick<User, '_id' | 'status'>;
export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type VerifyOtp = {
  email: string;
  otp: number;
};

export type QueryOptions = {
  page: number;
  limit: number;
  orderBy: string;
  order: string;
  search: string;
  searchBy: string;
};

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export type KYCData = {
  userId: mongoose.Types.ObjectId;
  address: {
    house_no: string;
    city: string;
    state: string;
    country: string;
  };
  pan_card: string | null;
  adhaar_card: string | null;
  passport: string | null;
  drivers_id: string | null;
  image: string | null;
};
