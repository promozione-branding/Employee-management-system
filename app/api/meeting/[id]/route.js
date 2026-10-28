// app/api/meeting/[id]/route.js

import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";
import Customer from "@/models/admin/Customer";
import User from "@/models/admin/User";
import nodemailer from "nodemailer";
import { recordEdit } from "@/lib/auditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { withAudit } from "@/lib/withAudit";
import Employee from "@/models/employee/Employee";

const Admin_for_updateOfCallMeetingGeneral = (
  process.env.Admin_for_updateOfCallMeetingGeneral ||
  "sourabh@inquirybazaar.com"
)
  .toLowerCase()
  .trim();

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const {
      salesPersonId,
      salesPerson,
      clientId,
      updateType,
      status,
      note,
      reminderAt,
      meetingAt,
      subject,
      sendToSelf,
      ccAdmin,
      mailRecipients,
    } = await req.json();

    console.log("=== MEETING UPDATE START ===");
    console.log("Meeting ID:", id);
    console.log("updateType:", updateType);
    console.log("sendToSelf:", sendToSelf, "| ccAdmin:", ccAdmin);

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 },
      );
    }

    meeting.meetingUpdate.push({
      salesPersonId,
      salesPerson,
      clientId,
      updateType,
      status,
      note,
      reminderAt,
      meetingAt,
    });

    await meeting.save();

    // ── Audit Hook (unchanged) ──
    try {
      const authUser = await getAuthUser(req);
      if (authUser) {
        await recordEdit({
          clientId,
          module: "meeting",
          entityId: meeting._id,
          action: "UPDATE",
          summary: `Added ${updateType || "general"} update: ${
            note ? `"${note.substring(0, 40)}..."` : "No note"
          }`,
          actor: { userId: authUser._id },
          isConfidential: false,
          afterSnapshot:
            meeting.meetingUpdate[meeting.meetingUpdate.length - 1],
          req,
        });
      }
    } catch (auditErr) {
      console.error(
        "[edit-history] failed to record meeting update:",
        auditErr,
      );
    }
    // ── END AUDIT HOOK ──

    const findCustomer = await Customer.findById(clientId);

    // =========================================================
    // MAIL DECISION
    // =========================================================
    const mailEnabled =
      typeof sendToSelf === "boolean" ? sendToSelf : updateType === "meeting";

    if (mailEnabled) {
      const creator = await User.findById(salesPersonId).select(
        "email username role",
      );
      const creatorEmail = creator?.email?.toLowerCase().trim() || "";
      const creatorName = creator?.username || "Unknown";
      const creatorRole = creator?.role || "unknown";

      // ── PRIMARY ADMIN (only sourabh) ──
      let primaryAdminEmail = "";
      const shouldIncludeAdmin =
        typeof ccAdmin === "boolean" ? ccAdmin : updateType === "meeting";
      if (shouldIncludeAdmin && Admin_for_updateOfCallMeetingGeneral) {
        primaryAdminEmail = Admin_for_updateOfCallMeetingGeneral;
      }

      // ── Extra CC from ticked recipients (User OR Employee) ──
      const extraIds = Array.isArray(mailRecipients) ? mailRecipients : [];

      let extraEmails = [];
      if (extraIds.length) {
        const userHits = await User.find({ _id: { $in: extraIds } }).select(
          "email",
        );
        const empHits = await Employee.find({ _id: { $in: extraIds } }).select(
          "basicDetails.email",
        );

        extraEmails = [
          ...userHits.map((u) => u.email?.toLowerCase().trim()),
          ...empHits.map((e) => e.basicDetails?.email?.toLowerCase().trim()),
        ].filter(Boolean);
      }

      const ccCandidates = [primaryAdminEmail, ...extraEmails].filter(Boolean);
      const ccEmails = [
        ...new Set(ccCandidates.filter((e) => e && e !== creatorEmail)),
      ];

      console.log("To (creator):", creatorEmail);
      console.log("CC:", ccEmails);

      if (creatorEmail || ccEmails.length > 0) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.YOUR_EMAIL_ADDRESS,
              pass: process.env.YOUR_APP_PASSWORD,
            },
          });

          // ── Default subject: "{Client Name} - {Update Type}" ──
          const clientName =
            findCustomer?.name || findCustomer?.company || "Client";
          const typeLabel =
            updateType === "meeting"
              ? "Meeting"
              : updateType === "call"
                ? "Call"
                : "General";
          const defaultSubject = `${clientName} - ${typeLabel}`;
          const finalSubject =
            updateType === "general" && subject && subject.trim()
              ? subject.trim()
              : defaultSubject;

          await transporter.sendMail({
            from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,
            to: creatorEmail || process.env.YOUR_EMAIL_ADDRESS,
            cc: ccEmails,
            subject: finalSubject,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
                <div style="background: #1d4ed8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0;">${typeLabel} Updated</h2>
                  <p style="margin: 5px 0 0;">Updated by <strong>${creatorName}</strong></p>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">
                  <p>An update was added by <strong>${creatorName}</strong>.</p>
                  <h3 style="color: #1d4ed8;">Update Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${
                      updateType === "general" && subject && subject.trim()
                        ? `<tr><td style="padding: 8px 0; font-weight: bold;">Subject</td><td style="padding: 8px 0;">${subject.trim()}</td></tr>`
                        : ""
                    }
                    <tr><td style="padding: 8px 0; font-weight: bold;">Updated By</td><td style="padding: 8px 0;">${creatorName}${creatorEmail ? ` (${creatorEmail})` : ""}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Role</td><td style="padding: 8px 0;">${creatorRole}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Client</td><td style="padding: 8px 0;">${findCustomer?.name || "-"}${findCustomer?.company ? ` – ${findCustomer.company}` : ""}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Update Type</td><td style="padding: 8px 0;">${typeLabel}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Status</td><td style="padding: 8px 0;">${status || "-"}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Meeting Date</td><td style="padding: 8px 0;">${meetingAt ? new Date(meetingAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-"}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Note</td><td style="padding: 8px 0;">${note || "-"}</td></tr>
                  </table>
                  <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />
                  <p>Please check the ERP dashboard for complete details.</p>
                </div>
              </div>
            `,
          });

          console.log("✅ EMAIL SENT → To:", creatorEmail, "| CC:", ccEmails);
        } catch (mailError) {
          console.error("❌ EMAIL ERROR:", mailError.message);
        }
      } else {
        console.log("⚠️ No recipients — email skipped");
      }
    } else {
      console.log("📭 Mail disabled for this update — skipped");
    }

    console.log("=== MEETING UPDATE END ===");

    return NextResponse.json(
      {
        success: true,
        message: "Meeting updated successfully",
        data: meeting,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ UPDATE MEETING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
