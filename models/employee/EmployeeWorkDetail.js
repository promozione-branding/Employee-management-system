import mongoose from "mongoose";

const ChecklistItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    label: {
      type: String,
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
      type: String,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
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

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCycle",
      required: true,
      index: true,
    },

    department: {
      type: String,
      enum: [
        "SEO",
        "WEB_DEVELOPER",
        "SOCIAL_MEDIA",
        "ADS_MANAGER",
        "OTHER",
        "SALES",
      ],
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
      departmentType: {
        type: String,
        enum: ["SEO", "WEB_DEVELOPER", "SOCIAL_MEDIA", "ADS_MANAGER", "OTHER"],
      },
      completeField: {
        type: Number,
        default: 0,
      },
      totalField: {
        type: Number,
        default: 0,
      },
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.EmployeeWorkDetail ||
  mongoose.model("EmployeeWorkDetail", EmployeeWorkDetailSchema);
