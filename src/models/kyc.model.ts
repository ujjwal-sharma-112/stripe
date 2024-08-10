import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
    },
    address: {
      type: {
        house_no: String,
        city: String,
        state: String,
        country: String,
      },
    },
    pan_card: {
      type: String,
    },
    adhaar_card: {
      type: String,
    },
    passport: {
      type: String,
    },
    drivers_id: {
      type: String,
    },
    image: {
      type: String,
    },
    kyc_status: {
      type: String,
      enum: ['PENDING', 'REJECTED', 'APPROVED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

kycSchema.plugin(mongooseAggregatePaginate);

interface KYCDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  address: {
    house_no: string;
    city: string;
    state: string;
    country: string;
  };
  pan_card: string;
  adhaar_card: string;
  passport: string;
  drivers_id: string;
  image: string;
  kyc_status: string;
}

const KYCModel = mongoose.model<
  KYCDocument,
  mongoose.AggregatePaginateModel<KYCDocument>
>('kycs', kycSchema);

export default KYCModel;
