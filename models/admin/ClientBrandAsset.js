// models/admin/ClientBrandAsset.js

import mongoose from "mongoose";
import { auditPlugin } from "@/lib/auditPlugin";

const phoneValidator = {
  validator: function (v) {
    if (v == null || v === "") return true; // optional
    return /^\d{10}$/.test(v);
  },
  message: "Phone number must be exactly 10 digits",
};

const ClientBrandAssetSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true,
    },

    primaryPhone: {
      type: String,
      trim: true,
      validate: phoneValidator,
    },

    secondaryPhone: {
      type: String,
      trim: true,
      validate: phoneValidator,
    },

    websites: [
      {
        type: String,
        trim: true,
      },
    ],

    maidIds: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // R2 / CDN URLs
    logos: [{ type: String, trim: true }],
    products: [{ type: String, trim: true }],

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Audit hook (CREATE/UPDATE via .save())
ClientBrandAssetSchema.plugin(auditPlugin, {
  module: "ClientBrandAsset",
  clientIdPath: "clientId",
});

export default mongoose.models.ClientBrandAsset ||
  mongoose.model("ClientBrandAsset", ClientBrandAssetSchema);
