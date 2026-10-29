// lib/mail/keywordMailer.js
//
// Sends "New Keyword" notifications.
//   To  : creator (currently logged-in user)
//   CC  : ALL users with role === "admin" — MINUS the creator (no duplicate)
//   Never throws — mail failure must never break DB save.
//
// Project lookup: keyword.projectId is a subdocument _id inside
// ProjectCycle.projectDuration[]. We try known model paths, then fall
// back to client.company → client.name → raw id.

import nodemailer from "nodemailer";
import User from "@/models/admin/User";

// ── Known candidate model paths for the project container ──
const PROJECT_MODEL_CANDIDATES = [
  { path: "@/models/admin/ProjectCycle", arrayField: "projectDuration", nameField: "projectName" },
  { path: "@/models/admin/CustomerProjectCycle", arrayField: "projectDuration", nameField: "projectName" },
  { path: "@/models/customer/ProjectCycle", arrayField: "projectDuration", nameField: "projectName" },
  { path: "@/models/admin/SeoProjectCycle", arrayField: "projectDuration", nameField: "projectName" },
];

async function resolveProjectLabel(projectId, clientDoc) {
  const fallback =
    clientDoc?.company ||
    clientDoc?.name ||
    (projectId ? String(projectId) : "-");

  if (!projectId) return fallback;

  for (const c of PROJECT_MODEL_CANDIDATES) {
    try {
      const mod = await import(c.path);
      const Model = mod?.default;
      if (!Model || !Model.findOne) continue;

      // Find parent whose projectDuration array contains this subdoc _id
      const parent = await Model.findOne({
        [`${c.arrayField}._id`]: projectId,
      })
        .select(c.arrayField)
        .lean();
      if (!parent) continue;

      const sub = (parent[c.arrayField] || []).find(
        (p) => String(p._id) === String(projectId),
      );
      const name = sub?.[c.nameField];
      if (name && String(name).trim()) return String(name).trim();
    } catch {
      // model not found / mismatch — try next candidate
    }
  }

  return fallback;
}

/**
 * @param {Object} args
 * @param {string} args.action        "created" | "updated"
 * @param {Object} args.keywordDoc    Keyword doc (keyword, type, projectId, _id)
 * @param {Object} args.actorUser     { _id, username, email }
 * @param {Object} args.clientDoc     { _id, name, company }
 * @param {string} [args.link]        Optional deep-link
 */
export async function sendKeywordMail({
  action = "created",
  keywordDoc,
  actorUser,
  clientDoc,
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

    // CC = all admins MINUS creator (bulletproof)
    const ccSet = new Set(adminEmails);
    if (creatorEmail) ccSet.delete(creatorEmail);
    const ccEmails = Array.from(ccSet).filter(
      (e) => e && e.toLowerCase() !== creatorEmail,
    );

    if (!creatorEmail && ccEmails.length === 0) {
      console.log("[keyword-mail] No recipients — skipped");
      return;
    }

    // ── Client info ──
    const clientName = clientDoc?.name || "";
    const clientCompany = clientDoc?.company || "";
    // Subject uses company first, then client name, then "Client"
    const subjectName = clientCompany || clientName || "Client";

    // ── Project label ──
    const projectLabel = await resolveProjectLabel(
      keywordDoc?.projectId,
      clientDoc,
    );

    // ── Subject: "{Company Name} - keyword update info" ──
    const subject = `${subjectName} - keyword update info`;

    const typeLabel = (keywordDoc?.type || "-").toString().toUpperCase();
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
              <tr><td style="padding: 8px 0; font-weight: bold;">Client</td><td style="padding: 8px 0;">${clientName || "-"}${clientCompany ? ` – ${clientCompany}` : ""}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Project</td><td style="padding: 8px 0;">${projectLabel}</td></tr>
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
      "| Project:",
      projectLabel,
    );
  } catch (err) {
    console.error("[keyword-mail] ❌ failed:", err.message);
  }
}
