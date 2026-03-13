import mongoose from "mongoose";

const TeamUpdateSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    updateType: {
      type: String,
      enum: ["call", "general"],
      default: "general",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    link: {
      type: String,
    },

    recipients: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.models.TeamUpdate ||
  mongoose.model("TeamUpdate", TeamUpdateSchema);
