import { Role, Status } from '../types/user.type';
import { UserModel } from '../models';
import { ErrorHandler } from '../middlewares';
import { HashHelper } from '../helpers';

class AdminService {
  public static async create() {
    try {
      const admin = await UserModel.findOne({ role: Role.ADMIN });

      if (admin) {
        throw ErrorHandler.conflict('Admin Already Exists.', 'User Conflict');
      }

      const { hash, salt } = HashHelper.generate('admin');

      await UserModel.create({
        first_name: 'Admin ',
        last_name: 'of Game Node',
        user_name: 'admin123',
        email: 'ujjwalsharma11290@gmail.com',
        password: hash,
        salt: salt,
        phone: 1234567890,
        dialing_code: 91,
        address: {
          country: 'India',
          state: 'Uttar Pradesh',
          city: 'Hapur',
        },
        department: null,
        role: Role.ADMIN,
        isVerified: true,
        isApproved: true,
        status: Status.ACTIVE,
        courses: [],
      });

      console.log('Admin Created Successfully.');
    } catch (error) {
      console.log(error);
    }
  }
}

export default AdminService;
