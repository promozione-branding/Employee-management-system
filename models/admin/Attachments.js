import mongoose from "mongoose";

const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    assetType: {
      type: String,
      enum: ["image", "video", "pdf", "docs", "other"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    // Cloudflare R2 / CDN URL
    file: {
      type: String,
      trim: true,
    },

    referenceLink: {
      type: String,
      trim: true,
    },

    // 🔥 IMPORTANT (ERP linking)
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    cc_email: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

const Attachment =
  mongoose.models.Attachment || mongoose.model("Attachment", AttachmentSchema);

export default Attachment;
