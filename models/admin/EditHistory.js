// models/admin/EditHistory.js

import mongoose from "mongoose";

const ChangeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const EditHistorySchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "CALL",
        "LOGIN",
        "EXPORT",
        "STATUS_CHANGE",
        "ACKNOWLEDGE",
      ],
      required: true,
      index: true,
    },
    changes: {
      type: [ChangeSchema],
      default: [],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    performedByName: { type: String, default: "" },
    performedByEmail: { type: String, default: "" },
    performedByRole: {
      type: String,
      enum: ["admin", "manager", "sales", "employee", "system"],
      default: "employee",
      index: true,
    },
    performedByEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    isConfidential: {
      type: Boolean,
      default: false,
      index: true,
    },
    beforeSnapshot: { type: mongoose.Schema.Types.Mixed },
    afterSnapshot: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

EditHistorySchema.index({ clientId: 1, createdAt: -1 });
EditHistorySchema.index({ clientId: 1, module: 1, createdAt: -1 });
EditHistorySchema.index({ clientId: 1, performedByRole: 1, createdAt: -1 });

const EditHistory =
  mongoose.models.EditHistory ||
  mongoose.model("EditHistory", EditHistorySchema);

export default EditHistory;
