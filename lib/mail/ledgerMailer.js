// lib/mail/ledgerMailer.js
//
// Sends "Ledger Entry Recorded/Updated" notifications.
//   To  : actor (currently logged-in user)
//   CC  : ALL users with role === "admin" — MINUS the actor (no duplicate)
//   Never throws — mail failure must never break the ledger save.

import nodemailer from "nodemailer";
import User from "@/models/admin/User";

const fmtAmount = (n) => {
  const v = Number(n) || 0;
  return `₹ ${v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const capitalise = (s) => {
  if (!s) return "-";
  return String(s)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * @param {Object} args
 * @param {"created"|"updated"} args.action
 * @param {Object} args.ledgerDoc      The LedgerNew doc (has: date, particulars, voucher,
 *                                     credit, debit, extraAmount, transactionId,
 *                                     isConfidential, proposalId, customerId)
 * @param {Object} args.actorUser      { _id, username, email } of the logged-in user
 * @param {Object} args.clientDoc      { _id, name, company } (Customer doc)
 * @param {Object} [args.proposalDoc]  { _id, proposalNumber, grandTotal, title } (optional)
 * @param {string} [args.link]         Optional deep-link
 */
export async function sendLedgerMail({
  action = "created",
  ledgerDoc,
  actorUser,
  clientDoc,
  proposalDoc,
  link,
}) {
  try {
    // ── Recipients ──
    const creatorEmail = (actorUser?.email || "").toLowerCase().trim();
    const creatorName = actorUser?.username || "Unknown";

    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins
      .map((a) => (a.email || "").toLowerCase().trim())
      .filter(Boolean);

    // CC = all admins MINUS actor (bulletproof dedupe)
    const ccSet = new Set(adminEmails);
    if (creatorEmail) ccSet.delete(creatorEmail);
    const ccEmails = Array.from(ccSet).filter(
      (e) => e && e.toLowerCase() !== creatorEmail,
    );

    if (!creatorEmail && ccEmails.length === 0) {
      console.log("[ledger-mail] No recipients — skipped");
      return;
    }

    // ── Client info ──
    const clientName = clientDoc?.name || "";
    const clientCompany = clientDoc?.company || "";
    const subjectName = clientCompany || clientName || "Client";

    // ── Proposal info ──
    const proposalNumber = proposalDoc?.proposalNumber || "-";
    const proposalTitle = proposalDoc?.title || "";

    // ── Amounts ──
    const credit = Number(ledgerDoc?.credit) || 0;
    const debit = Number(ledgerDoc?.debit) || 0;
    const extra = Number(ledgerDoc?.extraAmount) || 0;
    const total = credit - debit; // positive → payment in; negative → adjustment

    // ── Subject ──
    const actionLabel = action === "updated" ? "Updated" : "Recorded";
    const subject = `${subjectName} - Ledger Entry ${actionLabel}`;

    const when = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const confidentialBadge = ledgerDoc?.isConfidential
      ? `<span style="display:inline-block;background:#fef2f2;color:#b91c1c;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold;">CONFIDENTIAL</span>`
      : "";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.YOUR_EMAIL_ADDRESS,
        pass: process.env.YOUR_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,
      to: creatorEmail || process.env.YOUR_EMAIL_ADDRESS,
      cc: ccEmails,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Ledger Entry ${actionLabel}</h2>
            <p style="margin: 5px 0 0;">
              By <strong>${creatorName}</strong>
              ${confidentialBadge ? `&nbsp;&nbsp;${confidentialBadge}` : ""}
            </p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">

            <h3 style="color: #1e3a8a; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Client</td>
                  <td style="padding: 8px 0;">${clientName || "-"}${clientCompany ? ` – ${clientCompany}` : ""}</td></tr>
              ${
                proposalNumber && proposalNumber !== "-"
                  ? `<tr><td style="padding: 8px 0; font-weight: bold;">Proposal #</td>
                       <td style="padding: 8px 0;">${proposalNumber}${proposalTitle ? ` – ${proposalTitle}` : ""}</td></tr>`
                  : ""
              }
              <tr><td style="padding: 8px 0; font-weight: bold;">Payment Method</td>
                  <td style="padding: 8px 0;">${capitalise(ledgerDoc?.voucher)}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Particulars</td>
                  <td style="padding: 8px 0;">${ledgerDoc?.particulars || "-"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Transaction ID / UTR</td>
                  <td style="padding: 8px 0;">${ledgerDoc?.transactionId || "-"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Transaction Date</td>
                  <td style="padding: 8px 0;">${fmtDate(ledgerDoc?.date)}</td></tr>
            </table>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

            <h3 style="color: #1e3a8a;">Amount Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Amount Received</td>
                  <td style="padding: 8px 0;">${fmtAmount(credit)}</td></tr>
              ${
                extra > 0
                  ? `<tr><td style="padding: 8px 0; font-weight: bold;">Add-on Amount</td>
                       <td style="padding: 8px 0;">${fmtAmount(extra)}</td></tr>`
                  : ""
              }
              ${
                debit > 0
                  ? `<tr><td style="padding: 8px 0; font-weight: bold;">Debit</td>
                       <td style="padding: 8px 0;">${fmtAmount(debit)}</td></tr>`
                  : ""
              }
              <tr>
                <td style="padding: 12px 0 8px; font-weight: bold; border-top: 1px solid #e5e7eb;">Total Credited</td>
                <td style="padding: 12px 0 8px; border-top: 1px solid #e5e7eb; color: #16a34a; font-weight: bold; font-size: 16px;">
                  ${fmtAmount(total)}
                </td>
              </tr>
            </table>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

            <h3 style="color: #1e3a8a;">Audit</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">${action === "updated" ? "Updated" : "Recorded"} By</td>
                  <td style="padding: 8px 0;">${creatorName}${creatorEmail ? ` (${creatorEmail})` : ""}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Timestamp</td>
                  <td style="padding: 8px 0;">${when}</td></tr>
            </table>

            ${
              link
                ? `<hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                   <p><a href="${link}" style="color: #1e3a8a; font-weight: bold;">Open Ledger</a></p>`
                : ""
            }
            <p style="margin-top: 20px; color: #666; font-size: 13px;">This is an automated notification from the ERP.</p>
          </div>
        </div>
      `,
    });

    console.log(
      `[ledger-mail] ✅ ${action} sent → To:`,
      creatorEmail,
      "| CC:",
      ccEmails,
    );
  } catch (err) {
    console.error("[ledger-mail] ❌ failed:", err.message);
    // never rethrow
  }
}
