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
    openingBalance: { type: Number, default: 0 },

    entries: [
      {
        date: { type: Date, default: Date.now, required: true },
        voucher: { type: String, required: true },
        debit: { type: Number },
        credit: { type: Number },
        balance: { type: Number },
        particular: {
          description: { type: String, required: true },
          items: [
            {
              subDescription: { type: String },
              price: { type: Number, required: true },
            },
          ],
        },
        chequeDetails: {
          chequeNumber: Number,
          chequeDate: Date,
          chequeAmount: Number,
          bankName: String,
          branchName: String,
          ifscCode: String,
        },
        net_banking: {
          transactionId: String,
          transactionDate: Date,
          transactionAmount: Number,
        },
        upi: {
          upi_id: String,
          payerName: String,
          transactionId: String,
        },
        credit_debit_card: {
          card_type: {
            type: String,
            enum: ["credit", "debit"],
            default: "credit",
          },
          cardLastNo: Number,
          bankName: String,
          cardHolderName: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
