// models/admin/ReportClient.js
import mongoose from "mongoose";

const ReportClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", sparse: true }, // 👈 Link to your existing ERP
    emails: [{ type: String, trim: true, lowercase: true }],
    websites: [{ type: String, trim: true }],

    ga4PropertyIds:       [{ type: String, trim: true }],
    gscSiteUrls:          [{ type: String, trim: true }],
    googleAdsCustomerIds: [{ type: String, trim: true }],
    metaAdAccountIds:     [{ type: String, trim: true }],
    metaPageIds:          [{ type: String, trim: true }],

    status: { type: String, enum: ["active", "paused"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ReportClient || mongoose.model("ReportClient", ReportClientSchema);
