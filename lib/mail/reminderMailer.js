// lib/mail/reminderMailer.js
//
// Sends daily reminder digests.
//   To  : the employee who set the reminder (salesPersonId on the entry)
//   CC  : nobody — admin / Sourabh / anyone else NEVER receives it
//   Never throws — mail failure must never break cron
//
// Sends ONE digest per employee per day even if they have multiple
// reminders on the same day.

import nodemailer from "nodemailer";
import User from "@/models/admin/User";
import Employee from "@/models/employee/Employee";

// ── Formatting helpers ──
const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const capitalise = (s) =>
  String(s || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Resolve email + name for a salesPersonId.
 * Tries User first, then Employee as fallback.
 */
export async function resolveReminderRecipient(salesPersonId) {
  try {
    if (!salesPersonId) return null;

    const user = await User.findById(salesPersonId)
      .select("username email")
      .lean();
    if (user?.email) {
      return {
        email: user.email.toLowerCase().trim(),
        name: user.username || "there",
      };
    }

    const emp = await Employee.findById(salesPersonId)
      .select("basicDetails.name basicDetails.email")
      .lean();
    if (emp?.basicDetails?.email) {
      return {
        email: emp.basicDetails.email.toLowerCase().trim(),
        name: emp.basicDetails.name || "there",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * @param {Object} args
 * @param {Object} args.recipient  { email, name }
 * @param {Array}  args.items      [{ clientName, clientCompany, note, reminderAt, updateType }]
 */
export async function sendReminderMail({ recipient, items }) {
  try {
    // ── Recipients (only the employee — nobody else) ──
    const toEmail = (recipient?.email || "").toLowerCase().trim();
    const toName = recipient?.name || "there";

    if (!toEmail || !items?.length) {
      console.log("[reminder-mail] No recipient or no items — skipped");
      return;
    }

    // ── Subject: "{N} reminder(s) for today" ──
    const count = items.length;
    const subject = `You have ${count} reminder${count > 1 ? "s" : ""} for today`;

    // ── Rows ──
    const rows = items
      .map(
        (it) => `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>${it.clientName || "Client"}</strong>
              ${it.clientCompany ? `<br/><span style="color:#6b7280; font-size:12px;">${it.clientCompany}</span>` : ""}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">
              ${capitalise(it.updateType)}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">
              ${fmtDate(it.reminderAt)}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
              ${it.note || "-"}
            </td>
          </tr>
        `,
      )
      .join("");

    const when = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.YOUR_EMAIL_ADDRESS,
        pass: process.env.YOUR_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ERP Reminders" <${process.env.YOUR_EMAIL_ADDRESS}>`,
      to: toEmail,
      // 👇 NO CC, NO BCC, NOBODY ELSE — only the employee
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 750px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Reminders for Today</h2>
            <p style="margin: 5px 0 0;">Hi <strong>${toName}</strong>, you have ${count} reminder${count > 1 ? "s" : ""} scheduled for today.</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #059669; margin-top: 0;">Your Reminders</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="text-align: left; padding: 10px 0;">Client</th>
                  <th style="text-align: left; padding: 10px 0;">Type</th>
                  <th style="text-align: left; padding: 10px 0;">Reminder At</th>
                  <th style="text-align: left; padding: 10px 0;">Note</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #666; font-size: 13px;">
              Generated at: ${when}
            </p>
            <p style="margin-top: 20px; color: #666; font-size: 13px;">
              This is an automated reminder from the ERP. Please log in to view full details and take action.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      "[reminder-mail] ✅ sent → To:",
      toEmail,
      "| items:",
      count,
    );
  } catch (err) {
    console.error("[reminder-mail] ❌ failed:", err.message);
    // never rethrow
  }
}
