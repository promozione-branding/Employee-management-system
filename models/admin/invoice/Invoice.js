import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: true,
    },
    ledgerEntry: {
      type: Boolean,
      default: false,
    },
    clientName: { type: String, required: true },
    clientCompany: { type: String, required: true },
    clientAddress: { type: String, required: true },
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
      { type: mongoose.Schema.ObjectId, ref: "InvoiceService", required: true },
    ],
    taxType: {
      type: String,
      enum: ["IGST", "SGST/CGST"],
      default: "SGST/CGST",
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
    },
    invoiceNo: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

InvoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    const lastInvoice = await this.constructor
      .findOne({
        invoiceNo: { $regex: `^${datePrefix}` },
      })
      .sort({ invoiceNo: -1 });

    let nextInvoiceNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNo) {
      const lastNumber = parseInt(lastInvoice.invoiceNo.slice(-2), 10);
      nextInvoiceNumber = lastNumber + 1;
    }
    this.invoiceNo = `${datePrefix}${String(nextInvoiceNumber).padStart(2, "0")}`;
  }

  next();
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
