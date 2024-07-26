import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  ques: String,
  sol: String,
}, {
  timestamps: true,
});

const FaqModel = mongoose.model("faq", faqSchema);

export default FaqModel;