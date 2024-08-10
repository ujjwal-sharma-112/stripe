import { AggregatePaginateModel, Document, model, Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const TransactionSchema = new Schema(
  {
    stripeId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    plan: {
      type: String,
    },
    credits: {
      type: Number,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  },
);

TransactionSchema.plugin(mongooseAggregatePaginate);

interface UserDocument extends Document {
  stripeId: string;
  amount: number;
  plan: string;
  credits: number;
  buyer: string;
  updatedAt: Date;
  createdAt: Date;
}

const TransactionModel = model<
  UserDocument,
  AggregatePaginateModel<UserDocument>
>('transactions', TransactionSchema);

export default TransactionModel;
