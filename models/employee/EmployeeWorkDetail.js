import mongoose from "mongoose";

const ChecklistItemSchema = new mongoose.Schema(
  {
    key: {
      type: String, // e.g. "keyword_research"
      required: true,
    },
    label: {
      type: String, // e.g. "Keyword research completed and approved"
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
    proofUrl: {
      type: String, // optional: drive link, screenshot, doc
    },
  },
  { _id: false },
);

const EmployeeWorkDetailSchema = new mongoose.Schema(
  {
    employeeId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
        index: true,
      },
    ],
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    department: {
      type: String,
      enum: ["SEO", "WEB_DEVELOPER", "SOCIAL_MEDIA", "ADS_MANAGER"],
      required: true,
      index: true,
    },

    checklist: {
      type: [ChecklistItemSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REVIEW", "ON_HOLD"],
      default: "IN_PROGRESS",
    },

    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin / manager
    },

    reviewNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.EmployeeWorkDetail ||
  mongoose.model("EmployeeWorkDetail", EmployeeWorkDetailSchema);
