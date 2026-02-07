import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
  {
    proposalNo: {
      type: String,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.ObjectId,
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
  { timestamps: true },
);

ProposalSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastProposal = await this.constructor
      .findOne()
      .sort({ createdAt: -1 });

    let nextProposalNumber = 1;
    if (lastProposal && lastProposal.proposalNo) {
      const lastNumber = parseInt(
        lastProposal.proposalNo.replace("PROMOP", ""),
        10,
      );
      nextProposalNumber = lastNumber + 1;
    }
    this.proposalNo = `PROMOP${String(nextProposalNumber).padStart(4, "0")}`;
  }
  next();
});

const Proposal =
  mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);

export default Proposal;
