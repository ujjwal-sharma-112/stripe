import { FaqModel, StaticModel } from '../models';
import { ErrorHandler } from '../middlewares';

class StaticService {
  public static async createDefaultStaticData() {
    try {
      const staticData = await StaticModel.findOne();
      if (staticData) {
        throw ErrorHandler.conflict('Static data already exists', 'Conflict');
      }

      await FaqModel.create({
        ques: 'What is the course duration?',
        sol: 'The course duration is 6 months',
      });

      await StaticModel.create({
        about_us: {
          title: 'About Us',
          content: 'This is the about us section',
        },
        privacy_policy: {
          title: 'Privacy Policy',
          content: 'This is the privacy policy section',
        },
        terms_and_conditions: {
          title: 'Terms & Conditions',
          content: 'This is the terms and conditions section',
        },
      });

      console.log('Default static data created successfully');
    } catch (error) {
      console.log(error);
    }
  }
}

export default StaticService;
