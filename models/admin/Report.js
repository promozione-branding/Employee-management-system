// models/admin/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "ReportClient", required: true, index: true },
    periodType: { type: String, enum: ["weekly", "monthly", "custom"], default: "monthly" },
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },
    data:        { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["draft", "sent", "failed"],
      default: "draft",
    },
    sentAt: Date,
    sentTo: String,
    error: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ReportSchema.index({ clientId: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Report ||
  mongoose.model("Report", ReportSchema);
