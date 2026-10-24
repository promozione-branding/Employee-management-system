// models/admin/ReportSetting.js
import mongoose from "mongoose";

const ReportSettingSchema = new mongoose.Schema(
  {
    key:   { type: String, unique: true, required: true },
    value: { type: String },
    meta:  { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.ReportSetting ||
  mongoose.model("ReportSetting", ReportSettingSchema);
