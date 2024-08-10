import JWT from 'jsonwebtoken';
import { ErrorHandler } from '../middlewares';

class JWTService {
  public static generate(payload: any) {
    try {
      return JWT.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
      });
    } catch (err) {
      throw ErrorHandler.internal(`Error: ${err}`, 'Internal Error');
    }
  }

  public static decode(token: string) {
    try {
      return JWT.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      throw ErrorHandler.internal(`Error: ${error}`, 'Internal Error');
    }
  }
}

export default JWTService;
