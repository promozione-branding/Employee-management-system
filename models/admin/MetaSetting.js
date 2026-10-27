// models/admin/MetaSetting.js
import mongoose from "mongoose";

const MetaSettingSchema = new mongoose.Schema(
  {
    key:   { type: String, unique: true, required: true },
    value: { type: String },
    meta:  { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.MetaSetting ||
  mongoose.model("MetaSetting", MetaSettingSchema);
