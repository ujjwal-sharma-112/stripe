import { Router } from 'express';
import { UserController } from '../controllers';
import { VerifyMiddleware } from '../middlewares';
import upload from '../middlewares/multer.middleware';

const userRouter = Router();

// 2FA
userRouter.put(
  '/enable-2fa',
  VerifyMiddleware.verify,
  UserController.enable_2fa,
);
userRouter.put(
  '/disable-2fa',
  VerifyMiddleware.verify,
  UserController.disable_2fa,
);
userRouter.post('/verify-2fa', UserController.verify_2fa);

// KYC
userRouter.post(
  '/request-kyc',
  [
    VerifyMiddleware.verify,
    upload.fields([
      {
        name: 'pan_card',
        maxCount: 1,
      },
      {
        name: 'adhaar_card',
        maxCount: 1,
      },
      {
        name: 'passport',
        maxCount: 1,
      },
      {
        name: 'drivers_id',
        maxCount: 1,
      },
      {
        name: 'image',
        maxCount: 1,
      },
    ]),
  ],
  UserController.requestKYC,
);

// Payment
userRouter.post(
  '/create-checkout-session',
  VerifyMiddleware.verify,
  UserController.createCheckoutSession,
);

export default userRouter;
