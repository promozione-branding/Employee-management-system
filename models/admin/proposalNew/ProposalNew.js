// models/admin/proposalNew/ProposalNew.js

import mongoose from "mongoose";

const ProposalItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    categoryLabel: { type: String },
    packageKey: { type: String, required: true },
    label: { type: String, required: true },
    duration: { type: String },
    durationLabel: { type: String },
    amount: { type: Number, required: true },
    custom: { type: Boolean, default: false },
  },
  { _id: true }
);

const PartialPaymentSchema = new mongoose.Schema(
  {
    paymentDuration: { type: String, required: true },
    paymentAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const DeliveredMetricSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ChecklistSectionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },
    items: [{ type: String }],
  },
  { _id: false }
);

const CategoryNoteSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const CityPageSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    keyword: { type: String, required: true },
  },
  { _id: false }
);

const ProposalNewSchema = new mongoose.Schema(
  {
    proposalNumber: { type: String, unique: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    salesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    items: [ProposalItemSchema],
    partialPayments: [PartialPaymentSchema],
    deliveryPeriod: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
    deliveredMetrics: [DeliveredMetricSchema],
    checklist: [ChecklistSectionSchema],
    
    categoryNotes: [CategoryNoteSchema],
    cityPages: [CityPageSchema],

    subtotal: { type: Number, default: 0 },
    gstRate: { type: Number, default: 0.18 },
    gstAmount: { type: Number, default: 0 },
    tdsApplicable: { type: Boolean, default: false },
    tdsRate: { type: Number, default: 0.02 },
    tdsAmount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["amount", "percentage"], default: "amount" },
    discountInput: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    validTill: { type: Date },
    paymentMethod: { type: String, default: "" },
    status: { type: String, enum: ["draft", "sent", "accepted", "rejected"], default: "draft" },
    acceptToken: { type: String, index: true },
    sentAt: { type: Date },
    sentToEmail: { type: String },
    acceptedAt: { type: Date },
    acceptedByEmail: { type: String },
    acceptedIp: { type: String },
  },
  { timestamps: true }
);

// ✅ FIXED: Generate proposal number based on the LATEST proposal, not total count
ProposalNewSchema.pre("save", async function (next) {
  if (this.proposalNumber) return next();

  const year = new Date().getFullYear();
  
  // Find the most recently created proposal to get the highest sequence
  const lastProposal = await mongoose
    .model("ProposalNew")
    .findOne({ proposalNumber: new RegExp(`^PROP-${year}-`) })
    .sort({ createdAt: -1 });

  let nextSeq = 1;
  if (lastProposal && lastProposal.proposalNumber) {
    const parts = lastProposal.proposalNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  this.proposalNumber = `PROP-${year}-${String(nextSeq).padStart(4, "0")}`;
  next();
});

export default mongoose.models.ProposalNew || mongoose.model("ProposalNew", ProposalNewSchema);
