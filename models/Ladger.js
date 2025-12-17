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
      required: true,
    },
    openingBalance: { type: Number, required: true },
    entries: [
      {
        date: { type: Date, default: Date.now, required: true },
        particular: {
          description: { type: String, required: true },
          items: [
            {
              subDescription: { type: String },
              price: { type: Number, required: true },
            },
          ],
        },
        voucher: { type: String, required: true },
        debit: { type: Number },
        credit: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
