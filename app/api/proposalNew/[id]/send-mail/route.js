import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailerNew";
import crypto from "crypto";
import mongoose from "mongoose";
import puppeteer from "puppeteer";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const proposal = await ProposalNew.findById(id).populate({ path: "clientId", select: "name company email phone" });
    if (!proposal) return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    if (!proposal.clientId?.email) return NextResponse.json({ success: false, message: "Client email not found" }, { status: 400 });

    if (!proposal.acceptToken) proposal.acceptToken = crypto.randomBytes(24).toString("hex");
    proposal.status = "sent";
    proposal.sentAt = new Date();
    await proposal.save();

    const baseUrl = process.env.APP_URL || process.env.BACKEND_URL || "http://localhost:3000";
    const acceptUrl = `${baseUrl}/proposal/accept-new/${proposal.acceptToken}`;

    // 1. GENERATE PDF USING PUPPETEER
    console.log("Launching Puppeteer to generate PDF...");
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    
    // ✅ PASS AUTH COOKIES from the current request to Puppeteer
    const cookies = req.headers.get("cookie");
    if (cookies) {
      const cookieParams = cookies.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return {
          name,
          value: rest.join("="),
          domain: new URL(baseUrl).hostname,
          path: "/",
        };
      });
      await page.setCookie(...cookieParams);
    }

    await page.goto(`${baseUrl}/proposal/pdf-print-new/${id}`, { waitUntil: "networkidle0" });
    
    // Wait for React to render the PDF
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    await browser.close();
    console.log("PDF Generated successfully!");

    // 2. SEND EMAIL
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #111827;">
        <p>Dear ${proposal.clientId.name || "Client"} ${proposal.clientId.company ? "- " + proposal.clientId.company : ""},</p>
        <p>I hope this email finds you well.</p>
        <p>I am writing to you to share with you the proposal for the marketing services that we discussed. At <strong>Inquiry Bazaar Pvt Ltd</strong>, we take great pride in offering customized solutions that align with your business goals. We are excited about the opportunity to work together and help your brand achieve its marketing objectives.</p>
        <p><strong>Please find attached the Proposal PDF for your reference.</strong></p>
        <div style="text-align:center; margin:30px 0;">
          <a href="${acceptUrl}" style="background:#1e3a5f; color:#fff; padding:12px 28px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
            Accept Proposal
          </a>
        </div>
        <p>Click the button above to review and accept the proposal. Proposal No: <strong>${proposal.proposalNumber}</strong> · Total: <strong>₹ ${Number(proposal.grandTotal).toLocaleString("en-IN")}</strong></p>
        <p>Best regards,</p>
        <p><strong>The Inquiry Bazaar</strong><br/>011 4260 3232</p>
      </div>
    `;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: MAIL_FROM,
      to: proposal.clientId.email,
      subject: `Proposal ${proposal.proposalNumber} from Inquiry Bazaar`,
      html,
      attachments: [{ filename: `${proposal.proposalNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
    });

    return NextResponse.json({ success: true, message: "Proposal & PDF sent" }, { status: 200 });
  } catch (error) {
    console.log("sendProposalMail error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
