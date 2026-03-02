import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  serviceTitle: String,
  amount: Number,
  duration: String,
  description: String,
  discountAmount: Number,
  discountPercentage: Number,
  finalAmount: Number,
});

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);
