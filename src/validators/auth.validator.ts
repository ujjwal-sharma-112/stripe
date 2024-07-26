import {
  LoginRequestDTO,
  UserCreateRequest,
  VerifyOtp,
} from "../types/user.type";
import joi from "joi";

class AuthValidator {
  public static async signUp(body: UserCreateRequest) {
    const schema = joi.object<UserCreateRequest>({
      first_name: joi.string().required(),
      last_name: joi.string(),
      user_name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      phone: joi.number().max(9999999999).min(1000000000).required(),
      dialing_code: joi.number(),
      address: {
        city: joi.string().required(),
        state: joi.string().required(),
        country: joi.string().required(),
      },
    });

    return schema.validate(body, { abortEarly: false });
  }

  public static async login(body: LoginRequestDTO) {
    const schema = joi
      .object<LoginRequestDTO>({
        email: joi.string(),
        username: joi.string(),
        phone: joi.number().max(9999999999).min(1000000000).messages({
          "number.min": "Please provide atleast 10 digits",
          "number.max": "Please provide only 10 digits",
        }),
        password: joi.string().required(),
      })
      .or("email", "username", "phone");

    return schema.validate(body, { abortEarly: false });
  }

  public static async verifyOtp(body: VerifyOtp) {
    const schema = joi.object<VerifyOtp>({
      email: joi.string().email().required(),
      otp: joi.number().required(),
    });

    return schema.validate(body, { abortEarly: false });
  }

  public static async resendOtp(body: { email: string }) {
    const schema = joi.object<{ email: string }>({
      email: joi.string().email().required(),
    });

    return schema.validate(body, { abortEarly: false });
  }

  public static async forgotPassword(body: { email: string }) {
    const schema = joi.object<{ email: string }>({
      email: joi.string().email().required(),
    });

    return schema.validate(body, { abortEarly: false });
  }
}

export default AuthValidator;
