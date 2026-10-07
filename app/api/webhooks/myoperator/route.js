// app/api/webhooks/myoperator/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";                 // 🔧 ADAPT ME
import CallLog from "@/models/employee/sales/CallLog";
import { durationToSeconds, normalizePhone } from "@/lib/myoperator";

// Map MyOperator event_type -> our status
function mapStatus(eventType, payload) {
  const t = (eventType || "").toLowerCase();
  if (t.includes("initiated") || t.includes("dial_begin")) return "initiated";
  if (t.includes("answered")) return "answered";
  if (t.includes("end")) return payload?.status || "completed";
  if (t.includes("failed")) return "failed";
  if (t.includes("summary") || t.includes("disposition")) return null;
  return null;
}

export async function POST(req) {
  try {
    await dbConnect();

    // Optional shared-secret check (add same value in MyOperator panel headers)
    const secret = req.headers.get("x-myop-webhook-secret");
    if (
      process.env.MYOP_WEBHOOK_SECRET &&
      secret !== process.env.MYOP_WEBHOOK_SECRET
    ) {
      // Not blocking hard — log & continue during initial rollout
      console.warn("[webhook] secret mismatch");
    }

    const body = await req.json();
    const {
      event_type,
      reference_id,
      session_id,
      customer_identifier,
      timestamp,
      payload = {},
    } = body || {};

    if (!reference_id && !payload?.reference_id) {
      // Some events only carry session_id; try to find by myoperatorCallId
      console.warn("[webhook] no reference_id in payload", body);
    }

    const refId = reference_id || payload?.reference_id;

    // Find the call log
    let log = null;
    if (refId) {
      log = await CallLog.findOne({ referenceId: refId });
    }
    if (!log && session_id) {
      log = await CallLog.findOne({ myoperatorCallId: session_id });
    }

    if (!log) {
      console.warn("[webhook] no matching CallLog for", refId || session_id);
      return NextResponse.json({ success: true, note: "no matching log" });
    }

    // Update fields
    const newStatus = mapStatus(event_type, payload);
    if (newStatus) log.status = newStatus;

    if (newStatus === "answered") log.connected = true;
    if (newStatus === "completed" || newStatus === "failed") {
      log.endedAt = new Date(payload?.end_time || payload?.modified || Date.now());
    }

    // Duration
    const dur =
      payload?.duration ||
      payload?.call_duration ||
      payload?.conversation_duration;
    if (dur) log.durationSeconds = durationToSeconds(dur);

    // Recording URL (may come in call.summary or call.end)
    const rec =
      payload?.recording_url ||
      payload?.recordingUrl ||
      payload?.recording ||
      payload?.recording_link;
    if (rec) log.recordingUrl = rec;

    // Customer number normalization
    if (payload?.customer_contact && !log.customerPhone) {
      log.customerPhone = normalizePhone(payload.customer_contact);
    }

    // Disposition
    if (payload?.disposition) log.disposition = payload.disposition;

    // Bookkeeping
    log.lastEventType = event_type || "";
    log.lastEventAt = new Date(timestamp || Date.now());
    log.rawWebhookPayloads.push(body);

    await log.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/webhooks/myoperator]", err);
    // Always 200 to avoid MyOperator retries storm — but log
    return NextResponse.json({ success: false, message: err.message });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ ok: true, service: "myoperator-webhook" });
}