import mongoose, { Schema } from "mongoose";

const invoiceServiceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    HSN: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const InvoiceService =
  mongoose.models.InvoiceService ||
  mongoose.model("InvoiceService", invoiceServiceSchema);

export default InvoiceService;
