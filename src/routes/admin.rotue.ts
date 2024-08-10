import { Router } from 'express';
import { AdminController } from '../controllers';
import { VerifyMiddleware } from '../middlewares';

const adminRouter = Router();

// C of CRUD
// R of CRUD
adminRouter.get('/users', VerifyMiddleware.verify, AdminController.getAllUsers);
adminRouter.get(
  '/kyc-request-users',
  VerifyMiddleware.verify,
  AdminController.getKycRequestUsers,
);
adminRouter.get(
  '/approved-kyc-users',
  VerifyMiddleware.verify,
  AdminController.getApprovedKycUsers,
);

// U of CRUD
adminRouter.put(
  '/status',
  VerifyMiddleware.verify,
  AdminController.changeStatus,
);

adminRouter.put(
  '/handle-kyc',
  VerifyMiddleware.verify,
  AdminController.handleKyc,
);

// D of CRUD

export default adminRouter;
