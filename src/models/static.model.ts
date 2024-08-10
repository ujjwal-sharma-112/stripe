import mongoose from 'mongoose';

const staticSchema = new mongoose.Schema({
  terms_and_conditions: {
    type: {
      title: String,
      content: String,
    },
    default: {
      title: 'Terms & Conditions',
      content: 'This is the terms and conditions content',
    },
  },
  privacy_policy: {
    type: {
      title: String,
      content: String,
    },
    default: {
      title: 'Privacy Policy',
      content: 'This is the privacy policy content',
    },
  },
  about_us: {
    type: {
      title: String,
      content: String,
    },
    default: {
      title: 'About Us',
      content: 'This is the about us content',
    },
  },
});

const StaticModel = mongoose.model('static', staticSchema);

export default StaticModel;
