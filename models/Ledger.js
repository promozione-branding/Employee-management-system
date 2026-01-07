import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    proposalIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
        index: true,
      },
    ],
    openingBalance: { type: Number, default: 0 },
    entries: [
      {
        proposalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Proposal",
          index: true,
        },
        date: { type: Date, default: Date.now, required: true },
        voucher: { type: String, required: true, trim: true },
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        particular: {
          description: { type: String, required: true, trim: true },
          items: [
            {
              subDescription: { type: String, trim: true },
              price: { type: Number, required: true, default: 0 },
            },
          ],
        },
        chequeDetails: {
          chequeNumber: { type: String, trim: true },
          chequeDate: Date,
          chequeAmount: { type: Number, default: 0 },
          accountNo: { type: String, trim: true },
          bankName: { type: String, trim: true },
          branchName: { type: String, trim: true },
          ifscCode: {
            type: String,
            uppercase: true,
            trim: true,
            validate: {
              validator: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
              message: "Invalid IFSC Code",
            },
          },
        },
        net_banking: {
          transactionId: { type: String, required: false, trim: true },
          transactionDate: Date,
          transactionAmount: { type: Number, default: 0 },
        },
        upi: {
          upi_id: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
          },
          payerName: { type: String, trim: true },
          transactionId: { type: String, trim: true },
        },
        credit_debit_card: {
          card_type: {
            type: String,
            enum: ["credit", "debit"],
            default: "credit",
          },
          cardLastNo: { type: String, trim: true },
          bankName: { type: String, trim: true },
          cardHolderName: { type: String, trim: true },
        },
      },
    ],
  },
  { timestamps: true, strictPopulate: false }
);

const Ledger = mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);

export default Ledger;
