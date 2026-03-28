import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
  {
    proposalNo: {
      type: String,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    ledgerEntry: {
      type: Boolean,
      default: false,
    },
    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
        serviceTitle: String,
        amount: Number,
        duration: String,
        description: String,
        discountAmount: Number,
        discountPercentage: Number,
        finalAmount: Number,
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
    proposalSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

ProposalSchema.pre("save", async function (next) {
  if (this.isNew) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `PR${year}${month}${day}`;

    const lastProposal = await this.constructor
      .findOne({
        proposalNo: { $regex: `^${datePrefix}` },
      })
      .sort({ proposalNo: -1 });

    let nextProposalNumber = 1;
    if (lastProposal && lastProposal.proposalNo) {
      const lastNumber = parseInt(lastProposal.proposalNo.slice(-2), 10);
      nextProposalNumber = lastNumber + 1;
    }
    this.proposalNo = `${datePrefix}${String(nextProposalNumber).padStart(2, "0")}`;
  }
  next();
});

const Proposal =
  mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);

export default Proposal;
