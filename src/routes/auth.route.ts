import { Router } from 'express';
import { AuthController } from '../controllers';
import { VerifyMiddleware } from '../middlewares';

const authRouter = Router();

authRouter.post('/sign-up', AuthController.signUp);
authRouter.post('/login', AuthController.login);
authRouter.post('/verify-otp', AuthController.verifyOtp);
authRouter.post('/resend-otp', AuthController.resendOtp);
authRouter.post('/forgot-password', AuthController.forgotPassMail);
authRouter.post(
  '/reset-password',
  VerifyMiddleware.verify,
  AuthController.updateForgotPassword,
);

export default authRouter;
