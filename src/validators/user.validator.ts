import joi from "joi";
import {
  ChangePasswordRequest,
  ChangeStatusRequest,
  UpdateUserRequest,
} from "../types/user.type";

interface Disable2faDTO {
  token: string;
}

interface VerifyOtp {
  token: string;
  userId: string;
}

class UserValidator {
  public static async updateProfile(req: UpdateUserRequest) {
    const schema = joi.object<UpdateUserRequest>({
      first_name: joi.string().min(3).max(30),
      last_name: joi.string().min(3).max(30),
      email: joi.string().email(),
      phone: joi.number(),
      address: {
        city: joi.string(),
        country: joi.string(),
        state: joi.string(),
      },
    });

    return schema.validate(req, { abortEarly: false });
  }

  public static async changeStatus(req: ChangeStatusRequest) {
    const schema = joi.object<ChangeStatusRequest>({
      _id: joi.string().required(),
      status: joi.string().valid("BLOCKED", "DELETED", "PENDING").required(),
    });

    return schema.validate(req, { abortEarly: false });
  }

  public static async changePassword(req: ChangePasswordRequest) {
    const schema = joi.object<ChangePasswordRequest>({
      confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
      oldPassword: joi.string().required(),
      newPassword: joi.string().required(),
    });

    return schema.validate(req, { abortEarly: false });
  }

  public static async disable2fa(req: Disable2faDTO) {
    const schema = joi.object<Disable2faDTO>({
      token: joi.string().required(),
    });

    return schema.validate(req, { abortEarly: false });
  }

  public static async verifyOtp(req: VerifyOtp) {
    const schema = joi.object<VerifyOtp>({
      token: joi.string().required(),
      userId: joi.string().required(),
    });

    return schema.validate(req, { abortEarly: false });
  }
}

export default UserValidator;
