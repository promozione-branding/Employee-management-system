// app/api/proposalNew/[id]/accept/route.js

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
    // Save the email of the person who actually clicked accept
    proposal.acceptedByEmail = proposal.sentToEmail || proposal.clientId?.email || "";
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
      
      // ✅ TO: The person who actually received and clicked the link
      const mainRecipient = proposal.sentToEmail || proposal.clientId?.email;
      
      if (!mainRecipient) {
        throw new Error("No recipient email found.");
      }

      // ✅ CC: Our company + The client's owner email (if different from who accepted)
      const ccEmails = new Set();
      
      // 1. Add our company email
      if (process.env.YOUR_EMAIL_ADDRESS) {
        ccEmails.add(process.env.YOUR_EMAIL_ADDRESS);
      }
      
      // 2. Add the client's owner email if it's different from the main recipient
      if (proposal.clientId?.email && proposal.clientId.email !== mainRecipient) {
        ccEmails.add(proposal.clientId.email);
      }

const mailOptions = {
  from: MAIL_FROM,
  to: mainRecipient,
  cc: ccEmails.size > 0 ? Array.from(ccEmails).join(", ") : undefined,
  subject: `Welcome to Inquiry Bazaar — Proposal Accepted`,
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">

  <title>Proposal Accepted | Inquiry Bazaar</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #f3f5f9;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
      border-spacing: 0;
    }

    a {
      text-decoration: none;
    }

    .email-container {
      width: 100%;
      max-width: 620px;
    }

    .email-content {
      padding: 36px 38px;
    }

    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }

      .email-content {
        padding: 27px 20px !important;
      }

      .email-header {
        padding: 24px 20px !important;
      }

      .email-footer {
        padding: 22px 20px !important;
      }

      .success-heading {
        font-size: 25px !important;
        line-height: 33px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f3f5f9;">

  <!-- Inbox preview text -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
    mso-hide:all;
  ">
    Your proposal has been accepted. Welcome to Inquiry Bazaar!
    Your accepted proposal PDF is attached for your records.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="width:100%; background-color:#f3f5f9;"
  >
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table
          role="presentation"
          class="email-container"
          width="620"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:620px;
            background-color:#ffffff;
            border:1px solid #e6eaf0;
            border-radius:12px;
            overflow:hidden;
          "
        >

          <!-- BRAND HEADER -->
          <tr>
            <td
              class="email-header"
              style="
                padding:28px 38px;
                background-color:#17365d;
                border-bottom:4px solid #e9a23b;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="left" valign="middle">
                    <div style="
                      color:#ffffff;
                      font-size:23px;
                      line-height:30px;
                      font-weight:700;
                      letter-spacing:-0.5px;
                    ">
                      Inquiry Bazaar
                    </div>

                    <div style="
                      margin-top:5px;
                      color:#d5dfed;
                      font-size:11px;
                      line-height:17px;
                      letter-spacing:1px;
                      text-transform:uppercase;
                    ">
                      Business Solutions &amp; Services
                    </div>
                  </td>

                  <td align="right" valign="middle">
                    <span style="
                      display:inline-block;
                      padding:7px 10px;
                      border:1px solid #7187a2;
                      border-radius:20px;
                      color:#ffffff;
                      font-size:10px;
                      line-height:14px;
                      font-weight:700;
                      letter-spacing:1px;
                    ">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td class="email-content" style="padding:36px 38px;">

              <!-- Success icon -->
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-bottom:22px;"
              >
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    width="58"
                    height="58"
                    bgcolor="#e8f7ee"
                    style="
                      width:58px;
                      height:58px;
                      border-radius:50%;
                      color:#16834a;
                      font-size:29px;
                      line-height:58px;
                      font-weight:700;
                      text-align:center;
                    "
                  >
                    &#10003;
                  </td>
                </tr>
              </table>

              <p style="
                margin:0 0 10px;
                color:#16834a;
                font-size:12px;
                line-height:18px;
                font-weight:700;
                letter-spacing:1.2px;
                text-transform:uppercase;
              ">
                Proposal successfully accepted
              </p>

              <h1
                class="success-heading"
                style="
                  margin:0 0 22px;
                  color:#17365d;
                  font-size:30px;
                  line-height:39px;
                  font-weight:700;
                  letter-spacing:-0.5px;
                "
              >
                Welcome to Inquiry Bazaar!
              </h1>

              <p style="
                margin:0 0 16px;
                color:#263449;
                font-size:15px;
                line-height:25px;
              ">
                Dear ${proposal.clientId?.name || "Client"},
              </p>

              <p style="
                margin:0 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Thank you for accepting proposal
                <strong style="color:#17365d;">
                  ${proposal.proposalNumber}
                </strong>.
                We are delighted to welcome you to
                <strong style="color:#263449;">
                  Inquiry Bazaar Pvt Ltd
                </strong>.
              </p>

              <p style="
                margin:0 0 25px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                We appreciate your trust in our team and look forward
                to building a successful partnership with you.
              </p>

              <!-- ACCEPTANCE CONFIRMATION CARD -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  background-color:#f5faf7;
                  border:1px solid #d7eee0;
                  border-radius:9px;
                "
              >
                <tr>
                  <td style="padding:22px;">

                    <p style="
                      margin:0 0 8px;
                      color:#16834a;
                      font-size:11px;
                      line-height:17px;
                      font-weight:700;
                      letter-spacing:1px;
                    ">
                      ACCEPTANCE CONFIRMED
                    </p>

                    <p style="
                      margin:0 0 10px;
                      color:#17365d;
                      font-size:17px;
                      line-height:25px;
                      font-weight:700;
                      overflow-wrap:anywhere;
                    ">
                      Proposal ${proposal.proposalNumber}
                    </p>

                    <p style="
                      margin:0;
                      color:#586579;
                      font-size:13px;
                      line-height:22px;
                    ">
                      Your accepted proposal PDF is attached to this
                      email for your records.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- NEXT STEPS -->
              <h2 style="
                margin:28px 0 12px;
                color:#17365d;
                font-size:17px;
                line-height:25px;
                font-weight:700;
              ">
                What happens next?
              </h2>

              <p style="
                margin:0 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Our team will reach out shortly to discuss the next
                steps and coordinate the start of your project.
                If you have any questions in the meantime, simply
                reply to this email.
              </p>

              <!-- CLOSING -->
              <p style="
                margin:24px 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Thank you once again for choosing Inquiry Bazaar.
                We look forward to working with you!
              </p>

              <p style="
                margin:0;
                color:#586579;
                font-size:13px;
                line-height:23px;
              ">
                Best regards,<br>
                <strong style="color:#17365d; font-size:14px;">
                  Team Inquiry Bazaar
                </strong><br>
                <a
                  href="tel:01142603232"
                  style="color:#586579; text-decoration:none;"
                >
                  011 4260 3232
                </a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              class="email-footer"
              style="
                padding:24px 38px;
                background-color:#f7f9fc;
                border-top:1px solid #e5eaf1;
              "
            >
              <p style="
                margin:0 0 7px;
                color:#344054;
                font-size:12px;
                line-height:19px;
                font-weight:700;
                text-align:center;
              ">
                Inquiry Bazaar Pvt Ltd
              </p>

              <p style="
                margin:0;
                color:#8993a4;
                font-size:11px;
                line-height:18px;
                text-align:center;
              ">
                This email and its attachment are intended for
                the designated recipient.
              </p>

              <p style="
                margin:10px 0 0;
                color:#a0a8b5;
                font-size:10px;
                line-height:16px;
                text-align:center;
              ">
                &copy; ${new Date().getFullYear()} Inquiry Bazaar.
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
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
