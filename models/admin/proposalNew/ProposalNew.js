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
    paymentAmount: { type: Number, required: true },
  },
  { _id: false }
);

const DeliveredMetricSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
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

const ProposalNewSchema = new mongoose.Schema(
  {
    proposalNumber: { type: String, unique: true, index: true },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    items: [ProposalItemSchema],
    partialPayments: [PartialPaymentSchema],
    deliveryPeriod: {
      type: String,
      enum: ["weekly", "monthly"],
      default: "weekly",
    },
    deliveredMetrics: [DeliveredMetricSchema],
    checklist: [ChecklistSectionSchema],
    subtotal: { type: Number, default: 0 },
    gstRate: { type: Number, default: 0.18 },
    gstAmount: { type: Number, default: 0 },
    discountType: {
      type: String,
      enum: ["amount", "percentage"],
      default: "amount",
    },
    discountInput: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    validTill: { type: Date },
    paymentMethod: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true }
);

ProposalNewSchema.pre("save", async function (next) {
  if (this.proposalNumber) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model("ProposalNew").countDocuments();
  const seq = String(count + 1).padStart(4, "0");
  this.proposalNumber = `PROP-${year}-${seq}`;
  next();
});

export default mongoose.models.ProposalNew ||
  mongoose.model("ProposalNew", ProposalNewSchema);
