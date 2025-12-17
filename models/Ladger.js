import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
    },
    openingBalance: { type: Number, required: true },
    entries: [
      {
        date: { type: Date, default: Date.now, required: true },
        description: { type: String, required: true },
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
        balance: { type: Number, required: true },
        paymentDetails: {
          method: {
            type: String,
            enum: ["cheque", "upi", "net_banking", "credit/debit_card"],
          },
          transactionId: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
