// app/api/cron/reminders/route.js
//
// GET /api/cron/reminders
//
// Runs daily at 9:30 AM IST (04:00 UTC).
// For every meetingUpdate entry:
//   - reminderAt is TODAY (IST) AND
//   - reminderSent !== true
// → group by salesPersonId → send ONE digest mail per employee
// → mark reminderSent = true on each entry
//
// Secure with CRON_SECRET header.

import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";
import Customer from "@/models/admin/Customer";
import {
  sendReminderMail,
  resolveReminderRecipient,
} from "@/lib/mail/reminderMailer";

// ── IST helpers ──
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const toIST = (date) => new Date(date.getTime() + IST_OFFSET_MS);

const startOfTodayIST = () => {
  const now = new Date();
  const ist = toIST(now);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();
  return new Date(Date.UTC(y, m, d) - IST_OFFSET_MS);
};

const endOfTodayIST = () => {
  const s = startOfTodayIST();
  return new Date(s.getTime() + 24 * 60 * 60 * 1000);
};

export async function GET(req) {
  try {
    // ── auth ──
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get("authorization") || "";

    if (secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const todayStart = startOfTodayIST();
    const todayEnd = endOfTodayIST();

    console.log(
      `[cron-reminders] window: ${todayStart.toISOString()} → ${todayEnd.toISOString()}`,
    );

    // ── find candidates ──
    const meetings = await Meeting.find({
      "meetingUpdate.reminderAt": { $gte: todayStart, $lt: todayEnd },
    }).lean();

    if (!meetings.length) {
      return NextResponse.json({
        success: true,
        message: "No reminders today",
        processed: 0,
      });
    }

    // ── flatten pending entries ──
    const pending = [];

    meetings.forEach((meeting) => {
      (meeting.meetingUpdate || []).forEach((entry, idx) => {
        if (!entry?.reminderAt) return;
        if (entry.reminderSent === true) return;

        const reminderAt = new Date(entry.reminderAt);
        if (reminderAt < todayStart || reminderAt >= todayEnd) return;

        pending.push({
          meetingId: meeting._id,
          entryIndex: idx,
          salesPersonId: entry.salesPersonId,
          clientId: entry.clientId,
          note: entry.note,
          reminderAt,
          updateType: entry.updateType || "general",
        });
      });
    });

    if (!pending.length) {
      return NextResponse.json({
        success: true,
        message: "No pending reminders today",
        processed: 0,
      });
    }

    // ── group by salesPersonId ──
    const byEmployee = new Map();
    for (const p of pending) {
      const key = String(p.salesPersonId);
      if (!byEmployee.has(key)) byEmployee.set(key, []);
      byEmployee.get(key).push(p);
    }

    // ── load customers in bulk ──
    const clientIds = [...new Set(pending.map((p) => String(p.clientId)))];
    const customers = await Customer.find({
      _id: { $in: clientIds },
    })
      .select("name company")
      .lean();
    const customerMap = new Map(customers.map((c) => [String(c._id), c]));

    // ── send per employee + collect indices to mark sent ──
    const sentMeetingUpdates = [];

    for (const [salesPersonId, items] of byEmployee.entries()) {
      const recipient = await resolveReminderRecipient(salesPersonId);
      if (!recipient) {
        console.warn(
          `[cron-reminders] no recipient for salesPersonId ${salesPersonId}`,
        );
        continue;
      }

      const mailItems = items.map((it) => {
        const c = customerMap.get(String(it.clientId)) || {};
        return {
          clientName: c.name || "",
          clientCompany: c.company || "",
          note: it.note,
          reminderAt: it.reminderAt,
          updateType: it.updateType,
        };
      });

      await sendReminderMail({ recipient, items: mailItems });

      items.forEach((it) => {
        sentMeetingUpdates.push({
          meetingId: it.meetingId,
          entryIndex: it.entryIndex,
        });
      });
    }

    // ── mark reminderSent flags ──
    const byMeeting = new Map();
    sentMeetingUpdates.forEach(({ meetingId, entryIndex }) => {
      const key = String(meetingId);
      if (!byMeeting.has(key)) byMeeting.set(key, new Set());
      byMeeting.get(key).add(entryIndex);
    });

    for (const [meetingId, indices] of byMeeting.entries()) {
      const meeting = await Meeting.findById(meetingId).select("meetingUpdate");
      if (!meeting) continue;

      indices.forEach((i) => {
        if (meeting.meetingUpdate[i]) {
          meeting.meetingUpdate[i].reminderSent = true;
          meeting.meetingUpdate[i].reminderSentAt = new Date();
        }
      });
      await meeting.save();
    }

    console.log(
      `[cron-reminders] done — ${sentMeetingUpdates.length} reminder entries marked sent`,
    );

    return NextResponse.json({
      success: true,
      message: "Reminders processed",
      processed: sentMeetingUpdates.length,
      employeesNotified: byEmployee.size,
    });
  } catch (err) {
    console.error("[cron-reminders] ❌", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
