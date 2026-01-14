import mongoose from "mongoose";

const AuditHistorySchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Customer", "Proposal", "Invoice", "Meeting", "Ledger", "User"],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

const AuditHistory =
  mongoose.models.AuditHistory ||
  mongoose.model("AuditHistory", AuditHistorySchema);

export default AuditHistory;
