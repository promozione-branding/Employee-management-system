// app/api/meeting/create/route.js

import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";
import Customer from "@/models/admin/Customer";
import User from "@/models/admin/User";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const {
      salesPersonId,
      salesPerson,
      clientId,
      updateType,
      status,
      note,
      reminderAt,
      meetingAt,
    } = await req.json();

    console.log("=== MEETING CREATE START ===");
    console.log("salesPersonId:", salesPersonId);
    console.log("salesPerson:", salesPerson);
    console.log("clientId:", clientId);

    const findCustomer = await Customer.findById(clientId);
    if (!findCustomer) {
      console.log("❌ Customer not found");
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    const createMeeting = await Meeting.create({
      meetingUpdate: [
        {
          salesPersonId,
          salesPerson,
          clientId,
          updateType,
          status,
          note,
          reminderAt,
          meetingAt,
        },
      ],
    });

    findCustomer.meetingUpdate = createMeeting._id;
    await findCustomer.save();

    // === CREATOR (To) ===
    const creator = await User.findById(salesPersonId).select(
      "email username role",
    );
    const creatorEmail = creator?.email?.toLowerCase().trim() || "";
    const creatorName = creator?.username || "Unknown";
    const creatorRole = creator?.role || "unknown";

    console.log("Creator found:", {
      name: creatorName,
      email: creatorEmail,
      role: creatorRole,
    });

    // === CC LIST ===
    // All admins
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins
      .map((a) => a.email?.toLowerCase().trim())
      .filter(Boolean);

    // All managers
    const managers = await User.find({ role: "manager" }).select("email");
    const managerEmails = managers
      .map((m) => m.email?.toLowerCase().trim())
      .filter(Boolean);

    // Assigned salesperson(s) from the meeting
    const assignedIds = Array.isArray(salesPerson) ? salesPerson : [];
    const assignedUsers = await User.find({
      _id: { $in: assignedIds },
    }).select("email");
    const assignedEmails = assignedUsers
      .map((u) => u.email?.toLowerCase().trim())
      .filter(Boolean);

    // Build final CC (no creator)
    const ccCandidates = [...adminEmails, ...managerEmails, ...assignedEmails];
    const ccEmails = [
      ...new Set(ccCandidates.filter((e) => e && e !== creatorEmail)),
    ];

    console.log("To (creator):", creatorEmail);
    console.log("CC (admins + managers + assigned):", ccEmails);

    // === SEND ===
    if (creatorEmail || ccEmails.length > 0) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.YOUR_EMAIL_ADDRESS,
            pass: process.env.YOUR_APP_PASSWORD,
          },
        });

        console.log("Sending email...");

        await transporter.sendMail({
          from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,
          to: creatorEmail || process.env.YOUR_EMAIL_ADDRESS,
          cc: ccEmails,
          subject: `New Meeting Created by ${creatorName}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
              <div style="background: #1d4ed8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">New Meeting Created</h2>
                <p style="margin: 5px 0 0;">Created by <strong>${creatorName}</strong></p>
              </div>
              <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">
                <p>A new meeting has been created by <strong>${creatorName}</strong>.</p>
                <h3 style="color: #1d4ed8;">Meeting Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Created By</td><td style="padding: 8px 0;">${creatorName}${creatorEmail ? ` (${creatorEmail})` : ""}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Role</td><td style="padding: 8px 0;">${creatorRole}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Client</td><td style="padding: 8px 0;">${findCustomer.name || "-"}${findCustomer.company ? ` – ${findCustomer.company}` : ""}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Update Type</td><td style="padding: 8px 0;">${updateType || "-"}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Status</td><td style="padding: 8px 0;">${status || "-"}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Meeting Date</td><td style="padding: 8px 0;">${meetingAt ? new Date(meetingAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-"}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Note</td><td style="padding: 8px 0;">${note || "-"}</td></tr>
                </table>
                <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p>Please check the ERP dashboard for complete meeting details.</p>
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

    console.log("=== MEETING CREATE END ===");

    return NextResponse.json(
      {
        success: true,
        message: "Meeting created successfully",
        data: createMeeting,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ CREATE MEETING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
