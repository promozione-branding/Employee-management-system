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
      {
        serviceName: String,
        HSN: String,
        price: Number,
      },
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

    const prefix = `INQ${year}`;

    const lastInvoice = await this.constructor
      .findOne({
        invoiceNo: { $regex: `^${prefix}` },
      })
      .sort({ invoiceNo: -1 });

    let nextNumber = 551;

    if (lastInvoice && lastInvoice.invoiceNo) {
      const lastNumber = parseInt(
        lastInvoice.invoiceNo.replace(prefix, ""),
        10
      );
      nextNumber = lastNumber + 1;
    }

    this.invoiceNo = `${prefix}${String(nextNumber).padStart(6, "0")}`;
  }

  next();
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
