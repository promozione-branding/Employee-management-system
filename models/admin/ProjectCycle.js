// models/admin/ProjectCycle.js

import mongoose from "mongoose";

   const RenewalSchema = new mongoose.Schema(
  {
    sentMilestones: { type: [String], default: [] },
    lastReminderAt: { type: Date, default: null },
  },
  { _id: false },
);

const ProjectDurationSchema = new mongoose.Schema(
  {
    employeeId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    projectName: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
    },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date },

    // ── proposal mapping (optional → existing rows untouched) ──
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProposalNew",
      default: null,
      index: true,
    },
    proposalNumber: { type: String, trim: true },
    category: { type: String, trim: true },
    categoryLabel: { type: String, trim: true },

    // Lifecycle: existing rows read as "in_build" → no reminders fire
    status: {
      type: String,
      enum: ["in_build", "live", "completed"],
      default: "in_build",
      index: true,
    },

    // Renewal anchor — set when admin flips to "live"
    activatedAt: { type: Date, default: null },
    renewalDuration: {
      type: String,
      enum: ["3m", "6m", "12m", "custom", null],
      default: null,
    },
    renewalEndDate: { type: Date, default: null, index: true },

    renewal: { type: RenewalSchema, default: () => ({}) },
  },
  { _id: true },
);

const ProjectCycleSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    projectDuration: [ProjectDurationSchema],
  },
  { timestamps: true },
);

// NOTE: indexes on status / renewalEndDate / proposalId are declared
// at the field level above (index: true). Do NOT also declare them here
// or Mongoose will warn about duplicate schema indexes.

const ProjectCycle =
  mongoose.models.ProjectCycle ||
  mongoose.model("ProjectCycle", ProjectCycleSchema);

export default ProjectCycle;
