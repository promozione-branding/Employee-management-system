// lib/mail/keywordMailer.js
//
// Sends "New Keyword" notifications.
//   To  : creator (currently logged-in user)
//   CC  : ALL users with role === "admin"
//   Never throws — mail failure must never break DB save.
//
// If you want the project NAME in the mail body, set PROJECT_MODEL_IMPORT
// below to the correct model path and PROJECT_NAME_FIELD to the correct
// field. Otherwise the raw projectId is used (safe fallback).

import nodemailer from "nodemailer";
import User from "@/models/admin/User";

// ── OPTIONAL: uncomment + fix these if you want project NAME in the mail ──
// import ProjectCycle from "@/models/admin/ProjectCycle"; // ← correct path
// const PROJECT_MODEL = ProjectCycle;
// const PROJECT_NAME_FIELD = "projectName";
const PROJECT_MODEL = null;
const PROJECT_NAME_FIELD = null;
// ──────────────────────────────────────────────────────────────────────

async function resolveProjectName(projectId) {
  if (!projectId) return "-";
  if (!PROJECT_MODEL) return String(projectId);
  try {
    const doc = await PROJECT_MODEL.findById(projectId)
      .select(PROJECT_NAME_FIELD)
      .lean();
    return doc?.[PROJECT_NAME_FIELD] || String(projectId);
  } catch {
    return String(projectId);
  }
}

/**
 * @param {Object} args
 * @param {string} args.action        "created" | "updated" (for subject/heading)
 * @param {Object} args.keywordDoc    The Keyword doc (must have keyword, type, projectId, _id)
 * @param {Object} args.actorUser     { _id, username, email } of the logged-in user
 * @param {Object} args.clientDoc     { _id, name, company } (Customer doc)
 * @param {string} [args.link]        Optional deep-link to SEO sheet
 */
export async function sendKeywordMail({
  action = "created",
  keywordDoc,
  actorUser,
  clientDoc,
  link,
}) {
  try {
    // ── Resolve recipients ──
    const creatorEmail = (actorUser?.email || "").toLowerCase().trim();
    const creatorName = actorUser?.username || "Unknown";

    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins
      .map((a) => (a.email || "").toLowerCase().trim())
      .filter(Boolean);

    const ccEmails = [
      ...new Set(adminEmails.filter((e) => e && e !== creatorEmail)),
    ];

    if (!creatorEmail && ccEmails.length === 0) {
      console.log("[keyword-mail] No recipients — skipped");
      return;
    }

    // ── Client info ──
    const clientName = clientDoc?.name || clientDoc?.company || "Client";
    const clientCompany = clientDoc?.company || "";

    // ── Project info ──
    const projectName = await resolveProjectName(keywordDoc?.projectId);

    // ── Subject & body ──
    const subject = `${clientName} - New Keyword: ${keywordDoc?.keyword || "-"}`;
    const typeLabel = (keywordDoc?.type || "-").toString().toUpperCase();
    const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

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
          <div style="background: #ea580c; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">New Keyword ${action === "updated" ? "Updated" : "Added"}</h2>
            <p style="margin: 5px 0 0;">By <strong>${creatorName}</strong></p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #ea580c; margin-top: 0;">Keyword Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Keyword</td><td style="padding: 8px 0;">${keywordDoc?.keyword || "-"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Type</td><td style="padding: 8px 0;">${typeLabel}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Client</td><td style="padding: 8px 0;">${clientName}${clientCompany ? ` – ${clientCompany}` : ""}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Project</td><td style="padding: 8px 0;">${projectName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Added By</td><td style="padding: 8px 0;">${creatorName}${creatorEmail ? ` (${creatorEmail})` : ""}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Timestamp</td><td style="padding: 8px 0;">${when}</td></tr>
            </table>
            ${
              link
                ? `<hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />
                   <p><a href="${link}" style="color: #ea580c; font-weight: bold;">Open SEO Sheet</a></p>`
                : ""
            }
            <p style="margin-top: 20px; color: #666; font-size: 13px;">This is an automated notification from the ERP.</p>
          </div>
        </div>
      `,
    });

    console.log(
      "[keyword-mail] ✅ sent → To:",
      creatorEmail,
      "| CC:",
      ccEmails,
    );
  } catch (err) {
    console.error("[keyword-mail] ❌ failed:", err.message);
    // never rethrow — mail must not break the API response
  }
}
