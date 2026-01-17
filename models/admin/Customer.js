import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    tanNo: {
      type: String,
    },
    email: { type: String, required: true },
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
    phone: {
      type: Number,
      required: true,
    },
    website: {
      type: String,
    },
    Address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String },
    meetingDate: { type: String },
    salesPersonEmail: { type: String },
    SalesPersonName: { type: String },
    notes: [
      {
        type: String,
      },
    ],
    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
    proposals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
      },
    ],
    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },
    projectCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCycle",
    },
    meetingUpdate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuditHistory",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
