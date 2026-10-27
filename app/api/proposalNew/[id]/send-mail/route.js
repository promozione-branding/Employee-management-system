// app/api/proposalNew/[id]/send-mail/route.js

import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailerNew";
import crypto from "crypto";
import mongoose from "mongoose";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid request payload" }, { status: 400 });
    }
    
    const targetEmail = body.email;
    if (!targetEmail) return NextResponse.json({ success: false, message: "Target email required" }, { status: 400 });
    
    // ✅ Backend validation
    if (!isValidEmail(targetEmail)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    const proposal = await ProposalNew.findById(id).populate({ path: "clientId", select: "name company email phone" });
    if (!proposal) return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    
    if (!proposal.clientId) {
      return NextResponse.json({ success: false, message: "Client data missing" }, { status: 400 });
    }
    
    if (!proposal.acceptToken) proposal.acceptToken = crypto.randomBytes(24).toString("hex");
    proposal.status = "sent";
    proposal.sentAt = new Date();
    proposal.sentToEmail = targetEmail;
    await proposal.save();

    const baseUrl = process.env.APP_URL || process.env.BACKEND_URL || "http://localhost:3000";
    const acceptUrl = `${baseUrl}/proposal/accept-new/${proposal.acceptToken}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 10px; color: #111827; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #1e3a5f; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Inquiry Bazaar Pvt Ltd</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="margin-top: 0; font-size: 16px;">Dear ${proposal.clientId.name || "Client"} ${proposal.clientId.company ? "- " + proposal.clientId.company : ""},</p>
            <p style="font-size: 16px;">I hope this email finds you well.</p>
            <p style="font-size: 16px;">I am writing to share the proposal for the marketing services we discussed. At <strong>Inquiry Bazaar Pvt Ltd</strong>, we take great pride in offering customized solutions that align with your business goals. We are excited about the opportunity to work together and help your brand achieve its marketing objectives.</p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Proposal No:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; font-size: 14px;">${proposal.proposalNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; font-size: 16px; color: #1e3a5f;">₹ ${Number(proposal.grandTotal).toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${acceptUrl}" style="background-color: #1e3a5f; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">View & Accept Proposal</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0;">Click the button above to view the full proposal PDF and accept it.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">The Inquiry Bazaar</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;"><a href="tel:01142603232" style="color: #6b7280; text-decoration: none;">011 4260 3232</a></p>
          </div>
        </div>
      </div>
    `;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: MAIL_FROM,
      to: targetEmail,
      subject: `Proposal ${proposal.proposalNumber} from Inquiry Bazaar`,
      html,
    });

    return NextResponse.json({ success: true, message: "Proposal mail sent" }, { status: 200 });
  } catch (error) {
    console.log("sendProposalMail error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
