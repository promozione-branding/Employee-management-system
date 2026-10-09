// models/employee/sales/CallLog.js

import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema(
  {
    // ============================================================
    // MYOPERATOR IDENTIFIERS
    // ============================================================
    // MyOperator's unique call id (echoed in webhooks + Search Logs)
    // Note: index is declared once below via CallLogSchema.index(...)
    myoperatorCallId: {
      type: String,
      sparse: true,
    },

    // OUR generated reference id — the golden thread.
    // Sent at OBD initiate time, echoed back in every webhook.
    // Unique per call so we can dedupe webhooks safely.
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Your MyOperator company id (6abd2f0bd0544239)
    companyId: {
      type: String,
      index: true,
    },

    // ============================================================
    // CALL BASICS
    // ============================================================
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
      index: true,
    },

    // Normalized to E.164 (e.g. +919876543210) for reliable matching
    fromNumber: { type: String, index: true },
    toNumber: { type: String, index: true },

    // The shared virtual number the call ran through
    virtualNumber: { type: String, index: true },

    // ============================================================
    // STATUS & DURATION
    // ============================================================
    status: {
      type: String,
      enum: [
        "initiated",
        "ringing",
        "answered",
        "completed",
        "missed",
        "busy",
        "failed",
        "cancelled",
      ],
      default: "initiated",
      index: true,
    },

    // Fast UI filter — avoids string matching in dashboards
    connected: { type: Boolean, default: false, index: true },

    durationSeconds: { type: Number, default: 0 },

    startedAt: { type: Date, index: true },
    endedAt: { type: Date },

    // ============================================================
    // RECORDING
    // ============================================================
    recordingUrl: { type: String, default: "" },
    // When we download + store it (S3 / local) instead of relying on MyOperator's expiring URL
    recordingStoredUrl: { type: String, default: "" },
    recordingFetchedAt: { type: Date },

    // ============================================================
    // AGENT ATTRIBUTION  (who made/handled the call)
    // ============================================================
    agentErpUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    agentName: { type: String, default: "" }, // denormalized for fast display
    agentEmail: { type: String, default: "" },
    agentMyopUserId: { type: String, default: "" }, // MyOperator UUID

    // ============================================================
    // CUSTOMER LINK
    // ============================================================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    customerName: { type: String, default: "" }, // denormalized
    customerPhone: { type: String, index: true }, // normalized E.164

    // ============================================================
    // OUTCOME
    // ============================================================
    disposition: { type: String, default: "" },
    note: { type: String, default: "" },

    // ============================================================
    // WEBHOOK BOOKKEEPING
    // ============================================================
    lastEventType: { type: String, default: "" },
    lastEventAt: { type: Date },
    rawWebhookPayloads: { type: [Object], default: [] }, // audit trail
  },
  { timestamps: true },
);

// ============================================================
// ⚡ PERFORMANCE INDEXES
// ============================================================
// 1) Salesperson dashboard — most common query
//    "show my calls, newest first"
CallLogSchema.index({ agentErpUserId: 1, startedAt: -1 });

// 2) Admin / manager dashboard — all calls newest first
CallLogSchema.index({ startedAt: -1 });

// 3) Per-customer call history page
//    "show all calls for this client"
CallLogSchema.index({ customerId: 1, startedAt: -1 });

// 4) Filter by status + connected (dashboard filters)
CallLogSchema.index({ connected: 1, startedAt: -1 });
CallLogSchema.index({ status: 1, startedAt: -1 });

// 5) Inbound matching — find call by caller number
CallLogSchema.index({ fromNumber: 1, startedAt: -1 });
CallLogSchema.index({ toNumber: 1, startedAt: -1 });

// 6) Webhook dedupe — fast lookup by MyOperator's id (also serves as unique identifier)
CallLogSchema.index({ myoperatorCallId: 1 }, { sparse: true });

// 7) Company-scoped queries (if you ever go multi-tenant)
CallLogSchema.index({ companyId: 1, startedAt: -1 });

const CallLog =
  mongoose.models.CallLog || mongoose.model("CallLog", CallLogSchema);

export default CallLog;