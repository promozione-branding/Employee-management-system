// lib/mail/workflowMailer.js
//
// Four mailers:
//   1. sendWorkflowStartedInternalMail  → To: creating admin, CC: other admins + managers
//   2. sendWorkflowStartedClientMail    → To: client
//   3. sendRenewalReminderMail          → internal (admins + managers), used by cron
//   4. sendRenewalReminderClientMail    → To: client, CC: admins + managers, used by cron
//
// Never throws.

import nodemailer from "nodemailer";
import User from "../../models/admin/User.js";

const FROM_ADDR = process.env.YOUR_EMAIL_ADDRESS;

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.YOUR_EMAIL_ADDRESS,
      pass: process.env.YOUR_APP_PASSWORD,
    },
  });
}

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function esc(v) {
  return String(v ?? "").replace(
    /[<>&"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
      })[c],
  );
}

// ─────────────────────────────────────────────────────────────
// 1. INTERNAL MAIL (admins + manager)
// ─────────────────────────────────────────────────────────────
export async function sendWorkflowStartedInternalMail({ workflow }) {
  try {
    const creatorEmail = (workflow.createdByAdminEmail || "")
      .toLowerCase()
      .trim();
    const creatorName = workflow.createdByAdminName || "Admin";

    const [admins, managers] = await Promise.all([
      User.find({ role: "admin" }).select("email").lean(),
      User.find({ role: "manager" }).select("email").lean(),
    ]);

    const adminEmails = admins
      .map((a) => (a.email || "").toLowerCase().trim())
      .filter(Boolean);
    const managerEmails = managers
      .map((m) => (m.email || "").toLowerCase().trim())
      .filter(Boolean);

    const ccSet = new Set([...adminEmails, ...managerEmails]);
    if (creatorEmail) ccSet.delete(creatorEmail);
    const ccEmails = Array.from(ccSet).filter(Boolean);

    if (!creatorEmail && ccEmails.length === 0) {
      console.log("[workflow-mail] no internal recipients — skipped");
      return;
    }

    const subject = `${workflow.clientCompany || workflow.clientName || "Client"} - Workflow Started`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:650px;margin:0 auto;padding:20px">
        <div style="background:#0f766e;color:#fff;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">🚀 Workflow Started</h2>
          <p style="margin:5px 0 0">By <strong>${esc(creatorName)}</strong></p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:25px;border-radius:0 0 8px 8px">
          <h3 style="color:#0f766e;margin-top:0">Workflow Details</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:bold;width:40%">Client Name</td><td>${esc(workflow.clientName || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Client Company</td><td>${esc(workflow.clientCompany || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Proposal Number</td><td>${esc(workflow.proposalNumber || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Service / Category</td><td>${esc(workflow.categoryLabel || workflow.category || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Description</td><td>${esc(workflow.description || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Start Date</td><td>${fmtDate(workflow.startDate)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">End Date</td><td>${fmtDate(workflow.endDate)}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666;font-size:13px">This is an automated notification from the ERP.</p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: `"ERP Workflow" <${FROM_ADDR}>`,
      to: creatorEmail || FROM_ADDR,
      cc: ccEmails,
      subject,
      html,
    });

    console.log(
      "[workflow-mail] internal ✅ To:",
      creatorEmail,
      "| CC:",
      ccEmails,
    );
  } catch (err) {
    console.error("[workflow-mail] internal ❌:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// 2. CLIENT MAIL (workflow started)
// ─────────────────────────────────────────────────────────────
export async function sendWorkflowStartedClientMail({ workflow }) {
  try {
    const to = (workflow.clientEmail || "").toLowerCase().trim();
    if (!to) {
      console.log("[workflow-mail] client has no email — skipped");
      return;
    }

    const subject = `Your ${workflow.categoryLabel || workflow.category || "service"} has started`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:650px;margin:0 auto;padding:20px">
        <div style="background:#0f766e;color:#fff;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">Service Started</h2>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:25px;border-radius:0 0 8px 8px">
          <p>Hello ${esc(workflow.clientName || "there")},</p>
          <p>Your service <strong>${esc(workflow.categoryLabel || workflow.category || "-")}</strong> has been started.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px">
            <tr><td style="padding:8px 0;font-weight:bold;width:40%">Service / Category</td><td>${esc(workflow.categoryLabel || workflow.category || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Start Date</td><td>${fmtDate(workflow.startDate)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">End Date</td><td>${fmtDate(workflow.endDate)}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666;font-size:13px">For any questions, please reply to this email.</p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: `"ERP Workflow" <${FROM_ADDR}>`,
      to,
      subject,
      html,
    });

    console.log("[workflow-mail] client ✅ To:", to);
  } catch (err) {
    console.error("[workflow-mail] client ❌:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// 3. RENEWAL REMINDER — INTERNAL (admins + managers)
// ─────────────────────────────────────────────────────────────
export async function sendRenewalReminderMail({ workflow, milestone }) {
  try {
    const [admins, managers] = await Promise.all([
      User.find({ role: "admin" }).select("email").lean(),
      User.find({ role: "manager" }).select("email").lean(),
    ]);

    const recipients = [...admins, ...managers]
      .map((u) => (u.email || "").toLowerCase().trim())
      .filter(Boolean);
    const uniqueRecipients = Array.from(new Set(recipients));

    if (!uniqueRecipients.length) {
      console.log("[workflow-renewal] no recipients — skipped");
      return;
    }

    const daysLeft = Math.ceil(
      (new Date(workflow.endDate) - new Date()) / (1000 * 60 * 60 * 24),
    );

    const subject = `Renewal Reminder (${daysLeft}d left) - ${workflow.clientCompany || workflow.clientName || "Client"}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:650px;margin:0 auto;padding:20px">
        <div style="background:#b91c1c;color:#fff;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">⏰ Renewal Reminder</h2>
          <p style="margin:5px 0 0">${daysLeft} day(s) remaining (milestone: ${esc(milestone)})</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:25px;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:bold;width:40%">Client</td><td>${esc(workflow.clientName || "-")} ${workflow.clientCompany ? `– ${esc(workflow.clientCompany)}` : ""}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Proposal</td><td>${esc(workflow.proposalNumber || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Service</td><td>${esc(workflow.categoryLabel || workflow.category || "-")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Start</td><td>${fmtDate(workflow.startDate)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">End</td><td>${fmtDate(workflow.endDate)}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666;font-size:13px">Please reach out to the client for renewal.</p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: `"ERP Workflow" <${FROM_ADDR}>`,
      to: uniqueRecipients[0],
      cc: uniqueRecipients.slice(1),
      subject,
      html,
    });

    console.log("[workflow-renewal] ✅ sent to:", uniqueRecipients);
  } catch (err) {
    console.error("[workflow-renewal] ❌:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// 4. RENEWAL REMINDER — CLIENT (client-facing tone)
//    To: client. CC: admins + managers. Never throws.
// ─────────────────────────────────────────────────────────────
export async function sendRenewalReminderClientMail({ workflow, milestone }) {
  try {
    const to = (workflow.clientEmail || "").toLowerCase().trim();
    if (!to) {
      console.log("[workflow-renewal-client] no client email — skipped");
      return;
    }

    const [admins, managers] = await Promise.all([
      User.find({ role: "admin" }).select("email").lean(),
      User.find({ role: "manager" }).select("email").lean(),
    ]);

    const ccEmails = [...admins, ...managers]
      .map((u) => (u.email || "").toLowerCase().trim())
      .filter((e) => e && e !== to);
    const uniqueCC = Array.from(new Set(ccEmails));

    const daysLeft = Math.ceil(
      (new Date(workflow.endDate) - new Date()) / (1000 * 60 * 60 * 24),
    );

    const clientName = workflow.clientName || "there";
    const serviceLabel =
      workflow.categoryLabel || workflow.category || "your service";

    const subject = `Reminder: ${serviceLabel} renews in ${daysLeft} day(s)`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:650px;margin:0 auto;padding:20px">
        <div style="background:#0f766e;color:#fff;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">Service Renewal Reminder</h2>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:25px;border-radius:0 0 8px 8px">
          <p>Hello ${esc(clientName)},</p>
          <p>
            This is a friendly reminder that your service
            <strong>${esc(serviceLabel)}</strong> is scheduled to end in
            <strong>${daysLeft} day(s)</strong>, on
            <strong>${fmtDate(workflow.endDate)}</strong>.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px">
            <tr><td style="padding:8px 0;font-weight:bold;width:40%">Service</td><td>${esc(serviceLabel)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Renewal Date</td><td>${fmtDate(workflow.endDate)}</td></tr>
          </table>
          <p style="margin-top:16px">
            If you'd like to renew or discuss the next cycle, just reply to this
            email and our team will get in touch.
          </p>
          <p style="margin-top:20px;color:#666;font-size:13px">
            Thank you for your continued trust.
          </p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: `"ERP Workflow" <${FROM_ADDR}>`,
      to,
      cc: uniqueCC,
      subject,
      html,
    });

    console.log(
      "[workflow-renewal-client] ✅ To:",
      to,
      "| CC:",
      uniqueCC,
      "| milestone:",
      milestone,
    );
  } catch (err) {
    console.error("[workflow-renewal-client] ❌:", err.message);
  }
}
