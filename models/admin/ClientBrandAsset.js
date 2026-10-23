// models/admin/ClientBrandAsset.js

import mongoose from "mongoose";
import { auditPlugin } from "@/lib/auditPlugin";

const phoneValidator = {
  validator: function (v) {
    if (v == null || v === "") return true;
    return /^\d{10}$/.test(v);
  },
  message: "Phone number must be exactly 10 digits",
};

// { url, description } — proper subdocument so Mongoose casts correctly
const FileEntrySchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const ClientBrandAssetSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true,
    },
    primaryPhone:   { type: String, trim: true, validate: phoneValidator },
    secondaryPhone: { type: String, trim: true, validate: phoneValidator },
    websites: [{ type: String, trim: true }],
    maidIds:  [{ type: String, trim: true, lowercase: true }],
    logos:    { type: [FileEntrySchema], default: [] },
    products: { type: [FileEntrySchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ClientBrandAssetSchema.plugin(auditPlugin, {
  module: "ClientBrandAsset",
  clientIdPath: "clientId",
});

export default mongoose.models.ClientBrandAsset ||
  mongoose.model("ClientBrandAsset", ClientBrandAssetSchema);
