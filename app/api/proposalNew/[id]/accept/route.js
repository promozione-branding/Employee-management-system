import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { NextResponse } from "next/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailerNew";
import mongoose from "mongoose";
import puppeteer from "puppeteer";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const { token } = await req.json();
    const proposal = await ProposalNew.findOne({ _id: id, acceptToken: token })
      .populate({ path: "clientId", select: "name email" });

    if (!proposal) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 404 });
    }
    if (proposal.status === "accepted") {
      return NextResponse.json({ success: true, message: "Already accepted" }, { status: 200 });
    }

    proposal.status = "accepted";
    proposal.acceptedAt = new Date();
    proposal.acceptedByEmail = proposal.clientId?.email || "";
    await proposal.save();

    const baseUrl = process.env.APP_URL || process.env.BACKEND_URL || "http://localhost:3000";
    let pdfBuffer = null;
    
    try {
      const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
      const page = await browser.newPage();
      const cookies = req.headers.get("cookie");
      
      if (cookies) {
        const cookieParams = cookies.split(";").map((c) => {
          const [name, ...rest] = c.trim().split("=");
          return { name, value: rest.join("="), domain: new URL(baseUrl).hostname, path: "/" };
        });
        await page.setCookie(...cookieParams);
      }
      
      await page.goto(`${baseUrl}/proposal/pdf-print-new/${id}`, { waitUntil: "networkidle0" });
      await new Promise((resolve) => setTimeout(resolve, 2500));
      pdfBuffer = await page.pdf({ format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
      await browser.close();
    } catch (pdfErr) {
      console.log("PDF generation failed for confirmation mail:", pdfErr);
    }

    try {
      const transporter = getTransporter();
      const mailOptions = {
        from: MAIL_FROM,
        to: proposal.clientId?.email,
        cc: process.env.YOUR_EMAIL_ADDRESS, 
        subject: `Welcome to Inquiry Bazaar — Proposal Accepted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #111827;">
            <p>Dear ${proposal.clientId?.name},</p>
            <p>Thank you for accepting proposal <strong>${proposal.proposalNumber}</strong>. We're delighted to welcome you to <strong>Inquiry Bazaar Pvt Ltd</strong>.</p>
            <p><strong>Please find your officially accepted proposal PDF attached to this email for your records.</strong></p>
            <p>Our team will reach out shortly to kick off your project.</p>
            <p>Best regards,<br/><strong>The Inquiry Bazaar</strong><br/>011 4260 3232</p>
          </div>
        `,
      };

      if (pdfBuffer) {
        mailOptions.attachments = [
          { filename: `${proposal.proposalNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }
        ];
      }

      await transporter.sendMail(mailOptions);
    } catch (mailErr) { 
      console.log("Thank-you mail error:", mailErr); 
    }

    return NextResponse.json({ success: true, message: "Proposal accepted and confirmation sent" }, { status: 200 });
  } catch (error) {
    console.log("acceptProposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
