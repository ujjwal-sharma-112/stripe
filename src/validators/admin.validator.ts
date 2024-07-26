import joi from "joi";

interface IHandleKYC {
  userId: string;
  kycId: string;
  status: string;
}

class AdminValidator {
  public static async handleKyc(req: IHandleKYC) {
    const schema = joi.object<IHandleKYC>({
      kycId: joi.string().required(),
      userId: joi.string().required(),
      status: joi.string().valid("APPROVED", "REJECTED").required(),
    });

    return schema.validate(req, { abortEarly: false });
  }
}

export default AdminValidator;
