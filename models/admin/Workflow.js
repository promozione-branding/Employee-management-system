// models/admin/Workflow.js

import mongoose from "mongoose";

const RENEWAL_MILESTONES = [
  "3m",
  "2m_1",
  "2m_2",
  "1m_1",
  "1m_2",
  "1m_3",
  "1m_4",
];

const WorkflowSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProposalNew",
      required: true,
      index: true,
    },
    proposalNumber: {
      type: String,
      trim: true,
    },

    // Service / category snapshot
    category: { type: String, required: true, trim: true },
    categoryLabel: { type: String, trim: true },

    description: { type: String, trim: true, default: "" },

    // Timeline — BOTH mandatory
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    duration: {
      type: String,
      enum: ["3m", "6m", "12m", "custom"],
      default: "3m",
    },

    // Snapshots — so mails/UI never break if client is renamed later
    clientName: { type: String, trim: true },
    clientCompany: { type: String, trim: true },
    clientEmail: { type: String, trim: true, lowercase: true },

    // Who created
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdByAdminName: { type: String, trim: true },
    createdByAdminEmail: { type: String, trim: true, lowercase: true },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    // Renewal reminder tracking (used by cron)
    renewal: {
      sentMilestones: {
        type: [String],
        default: [],
      },
      lastReminderAt: { type: Date, default: null },
      nextReminderAt: { type: Date, default: null, index: true },
    },
  },
  { timestamps: true },
);

WorkflowSchema.index({ createdAt: -1 });
WorkflowSchema.index({ customerId: 1, status: 1 });

export default mongoose.models.Workflow ||
  mongoose.model("Workflow", WorkflowSchema);
