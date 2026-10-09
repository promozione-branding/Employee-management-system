// app/api/webhooks/myoperator/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CallLog from "@/models/employee/sales/CallLog";
import Employee from "@/models/employee/Employee";
import Customer from "@/models/admin/Customer";
import { durationToSeconds, normalizePhone } from "@/lib/myoperator";

// ------------------------------------------------------------
// Map MyOperator event types to our statuses
// ------------------------------------------------------------
function mapEventToStatus(eventType, payload) {
  const t = (eventType || "").toLowerCase();
  if (t === "call.initiated") return "initiated";
  if (t === "call.dial_begin") return null; // don't change
  if (t === "call.answered") return "answered";
  if (t === "call.end") {
    const s = (payload?.status || "").toLowerCase();
    if (s === "bridged") return "completed";
    if (s === "missed") return "missed";
    if (s === "failed") return "failed";
    return "completed";
  }
  if (t === "call.summary") return null; // enrich only
  if (t === "disposition") return null; // tag only
  return null;
}

// ------------------------------------------------------------
// Extract agent info from a payload's legs[]
// ------------------------------------------------------------
function extractAgent(payload) {
  const legs = payload?.legs || [];
  for (const leg of legs) {
    if (leg?.type === "agent" && leg?.agent?.uuid) {
      return {
        uuid: leg.agent.uuid,
        name: leg.agent.name || "",
        email: leg.agent.email || "",
        contact: leg.agent.contact || leg.phone_number || "",
        answered: leg.result === "answered",
        talkDuration: leg.talk_duration || 0,
      };
    }
  }
  return null;
}

// ------------------------------------------------------------
// Try to find an Employee by MyOperator UUID
// (now stored inside basicDetails)
// ------------------------------------------------------------
async function findEmployeeByMyoperatorUuid(uuid) {
  if (!uuid) return null;
  try {
    return await Employee.findOne({
      "basicDetails.myoperatorUserId": uuid,
    })
      .select("_id basicDetails.name basicDetails.email")
      .lean();
  } catch (err) {
    console.warn("[webhook] Employee lookup failed:", err.message);
    return null;
  }
}

// ------------------------------------------------------------
// Try to find a Customer by phone number
// ------------------------------------------------------------
async function findCustomerByPhone(phone) {
  if (!phone) return null;
  try {
    const digits = String(phone).replace(/\D/g, "").slice(-10); // last 10 digits
    // Customer.phone is Number in your model — so we match with a regex on digits
    return await Customer.findOne({
      $expr: {
        $regexMatch: {
          input: { $toString: "$phone" },
          regex: digits + "$",
        },
      },
    })
      .select("_id name phone")
      .lean();
  } catch (err) {
    console.warn("[webhook] Customer lookup failed:", err.message);
    return null;
  }
}

// ------------------------------------------------------------
// POST — receive webhook events from MyOperator
// ------------------------------------------------------------
export async function POST(req) {
  try {
    await connectDB();

    // --- header diagnostic ---
    console.log(
      "[webhook] headers:",
      JSON.stringify({
        secret: req.headers.get("x-myop-webhook-secret"),
        contentType: req.headers.get("content-type"),
        envSecret: process.env.MYOP_WEBHOOK_SECRET,
      }),
    );

    // --- soft secret check ---
    const secret = req.headers.get("x-myop-webhook-secret");
    if (
      process.env.MYOP_WEBHOOK_SECRET &&
      secret !== process.env.MYOP_WEBHOOK_SECRET
    ) {
      console.warn("[webhook] secret mismatch");
    }

    // ---- parse body (MUST come before any use of `body`) ----
    const body = await req.json();

    // --- richer diagnostic (safe to remove later) ---
    console.log(
      "[webhook] received:",
      JSON.stringify(
        {
          event_type: body.event_type,
          session_id: body.session_id,
          direction: body.direction,
          status: body.payload?.status,
          duration: body.payload?.duration,
          recording_filename: body.payload?.recording_filename,
          client_ref_id: body.payload?.client_ref_id,
          ref_id: body.payload?.ref_id,
          customer_identifier: body.customer_identifier,
          system_identifier: body.system_identifier,
          payload_keys: Object.keys(body.payload || {}),
          legs: (body.payload?.legs || []).map((l) => ({
            type: l.type,
            phone: l.phone_number,
            result: l.result,
            dial_status: l.dial_status,
            dept_id: l.dept_id,
            started: l.started_at,
            answered: l.answered_at,
            ended: l.ended_at,
            ring: l.ring_duration,
            talk: l.talk_duration,
            agent_uuid: l.agent?.uuid,
            agent_name: l.agent?.name,
          })),
        },
        null,
        2,
      ),
    );

    const {
      event_type,
      session_id,
      direction,
      timestamp,
      customer_identifier,
      system_identifier,
      payload = {},
    } = body || {};

    if (!session_id) {
      console.warn("[webhook] no session_id", body);
      return NextResponse.json({ success: true, note: "no session_id" });
    }

    // ------------------------------------------------------------
    // 1. FIND OR CREATE the CallLog
    // ------------------------------------------------------------
    let log = await CallLog.findOne({ myoperatorCallId: session_id });

    // Fallback 1: match by our reference_id (client_ref_id in payload)
    if (!log && payload?.client_ref_id) {
      log = await CallLog.findOne({ referenceId: payload.client_ref_id });
    }
    // Fallback 2: match by myoperator internal ref_id
    if (!log && payload?.ref_id) {
      log = await CallLog.findOne({ myoperatorCallId: payload.ref_id });
    }

    // Fallback 3: if still nothing and this is call.initiated, create one
    if (!log && event_type === "call.initiated") {
      const isIncoming = direction === "incoming";
      const ourNumber = normalizePhone(system_identifier);
      const otherNumber = normalizePhone(customer_identifier);

      log = await CallLog.create({
        referenceId: `wh_${session_id}_${Date.now()}`,
        myoperatorCallId: session_id,
        companyId: body.company_id,
        direction: isIncoming ? "inbound" : "outbound",
        fromNumber: isIncoming ? otherNumber : ourNumber,
        toNumber: isIncoming ? ourNumber : otherNumber,
        virtualNumber: ourNumber,
        status: "initiated",
        connected: false,
        startedAt: payload?.started_at
          ? new Date(payload.started_at)
          : new Date(),
        customerPhone: otherNumber,
      });

      const cust = await findCustomerByPhone(otherNumber);
      if (cust) {
        log.customerId = cust._id;
        log.customerName = cust.name || "";
        log.customerPhone = normalizePhone(cust.phone);
      }

      await log.save();
    }

    if (!log) {
      console.warn(
        "[webhook] no matching CallLog for session_id:",
        session_id,
      );
      return NextResponse.json({ success: true, note: "no matching log" });
    }

    // ------------------------------------------------------------
    // 2. UPDATE fields based on event type
    // ------------------------------------------------------------
    const newStatus = mapEventToStatus(event_type, payload);
    if (newStatus) log.status = newStatus;

    if (event_type === "call.answered") {
      log.connected = true;
    }

    if (event_type === "call.end") {
      if (payload?.duration) {
        log.durationSeconds = durationToSeconds(payload.duration);
      }
      if (payload?.ended_at) log.endedAt = new Date(payload.ended_at);
      if (payload?.started_at) log.startedAt = new Date(payload.started_at);
      if (payload?.status === "bridged") log.connected = true;
      if (payload?.recording_filename) {
        log.recordingUrl = payload.recording_filename;
      }
      if (payload?.hangup?.cause) {
        log.disposition = log.disposition || payload.hangup.cause;
      }
      if (payload?.customer_number) {
        log.customerPhone = normalizePhone(payload.customer_number);
      }
    }

    if (event_type === "call.summary") {
      const agent = extractAgent(payload);
      if (agent) {
        log.agentMyopUserId = agent.uuid;
        log.agentName = agent.name || log.agentName;
        log.agentEmail = agent.email || log.agentEmail;

        if (!log.agentErpUserId) {
          const emp = await findEmployeeByMyoperatorUuid(agent.uuid);
          if (emp) {
            log.agentErpUserId = emp._id;
            log.agentName = emp.basicDetails?.name || log.agentName;
            log.agentEmail = emp.basicDetails?.email || log.agentEmail;
          }
        }
      }
      if (payload?.duration) {
        log.durationSeconds = durationToSeconds(payload.duration);
      }
      if (payload?.recording_filename) {
        log.recordingUrl = payload.recording_filename;
      }
      if (payload?.customer_number) {
        log.customerPhone = normalizePhone(payload.customer_number);
      }
    }

    if (event_type === "disposition") {
      const disp = payload?.dispositions?.[0];
      if (disp?.name) log.disposition = disp.name;
      const comment = payload?.comments?.[0];
      if (comment?.content) log.note = comment.content;
    }

    // ------------------------------------------------------------
    // 3. Try to link Customer if not linked yet
    // ------------------------------------------------------------
    if (!log.customerId && log.customerPhone) {
      const cust = await findCustomerByPhone(log.customerPhone);
      if (cust) {
        log.customerId = cust._id;
        log.customerName = cust.name || log.customerName;
        log.customerPhone = normalizePhone(cust.phone);
      }
    }

    // ------------------------------------------------------------
    // 4. Bookkeeping
    // ------------------------------------------------------------
    log.lastEventType = event_type || "";
    log.lastEventAt = new Date(timestamp || Date.now());

    log.rawWebhookPayloads = log.rawWebhookPayloads || [];
    log.rawWebhookPayloads.push(body);
    if (log.rawWebhookPayloads.length > 50) {
      log.rawWebhookPayloads = log.rawWebhookPayloads.slice(-50);
    }

    await log.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/webhooks/myoperator]", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}

// ------------------------------------------------------------
// GET — health check
// ------------------------------------------------------------
export async function GET() {
  return NextResponse.json({ ok: true, service: "myoperator-webhook" });
}