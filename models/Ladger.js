import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
    },
    openingBalance: { type: Number, required: true, default: 0 },
    
    entries: [
      {
        date: { type: Date, default: Date.now, required: true },
        voucher: { type: String, required: true },
        debit: { type: Number },
        credit: { type: Number },
        particular: {
          description: { type: String, required: true },
          items: [
            {
              subDescription: { type: String },
              price: { type: Number, required: true },
            },
          ],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
