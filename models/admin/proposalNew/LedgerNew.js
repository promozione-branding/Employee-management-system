import mongoose from "mongoose";

const LedgerEntryNewSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: "ProposalNew" },
    date: { type: Date, required: true },
    particulars: { type: String, required: true },
    voucher: { type: String, required: true },
    debit: { type: Number, default: 0 }, // Payment received
    credit: { type: Number, default: 0 }, // Service given / Refund
    extraAmount: { type: Number, default: 0 }, // Add-on payment
    transactionId: { type: String },
    isConfidential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.LedgerNew || mongoose.model("LedgerNew", LedgerEntryNewSchema);
