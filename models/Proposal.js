import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: true,
    },
    clientName: { type: String, required: true },
    clientCompany: { type: String, required: true },
    clientAddress: { type: String, required: true },
    dateOfProposal: { type: Date, default: Date.now },
    GSTIN: {
      type: String,
      required: true,
      minlength: 15,
      maxlength: 15,
      validate: {
        validator: (v) => /^[0-9A-Z]{15}$/.test(v),
        message: "Invalid GSTIN format",
      },
    },
    tanNo: {
      type: String,
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    discount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    validTill: Date,
    paymentMethod: String,
    partlyPayment: [
      {
        paymentDuration: { type: String },
        paymentAmount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Proposal ||
  mongoose.model("Proposal", ProposalSchema);
