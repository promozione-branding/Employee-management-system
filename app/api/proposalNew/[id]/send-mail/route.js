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
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />

  <title>Your Proposal - Inquiry Bazaar</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #f2f4f8;
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

    .email-wrapper {
      width: 100%;
      max-width: 620px;
    }

    .content {
      padding: 36px 38px;
    }

    .proposal-amount {
      font-size: 30px;
      line-height: 38px;
    }

    .cta-button {
      display: inline-block;
      padding: 15px 28px;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
      }

      .content {
        padding: 27px 20px !important;
      }

      .header {
        padding: 24px 20px !important;
      }

      .footer {
        padding: 22px 20px !important;
      }

      .proposal-amount {
        font-size: 26px !important;
        line-height: 34px !important;
      }

      .cta-button {
        display: block !important;
        padding: 16px 10px !important;
        text-align: center !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f2f4f8;">

  <!-- Email preview text -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
    mso-hide:all;
  ">
    Your Inquiry Bazaar proposal is ready. Review the details and find
    your proposal PDF attached to this email.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#f2f4f8;"
  >
    <tr>
      <td align="center" style="padding:28px 12px;">

        <table
          role="presentation"
          class="email-wrapper"
          width="620"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:620px;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              class="header"
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
                      color:#d6e1ef;
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
                      PROPOSAL
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMAIL BODY -->
          <tr>
            <td class="content" style="padding:36px 38px;">

              <p style="
                margin:0 0 12px;
                color:#c48624;
                font-size:12px;
                line-height:18px;
                font-weight:700;
                letter-spacing:1.2px;
                text-transform:uppercase;
              ">
                A new opportunity starts here
              </p>

              <h1 style="
                margin:0 0 22px;
                color:#17365d;
                font-size:29px;
                line-height:37px;
                font-weight:700;
                letter-spacing:-0.6px;
              ">
                Your proposal is ready.
              </h1>

              <p style="
                margin:0 0 16px;
                color:#263449;
                font-size:15px;
                line-height:25px;
              ">
                Dear ${proposal.clientId.name || "Client"}${proposal.clientId.company ? ` - ${proposal.clientId.company}` : ""},
              </p>

              <p style="
                margin:0 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                I hope you are doing well.
              </p>

              <p style="
                margin:0 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Thank you for considering Inquiry Bazaar for your
                marketing needs. We are pleased to share our proposal,
                thoughtfully prepared to align with your business
                objectives and help your brand grow.
              </p>

              <p style="
                margin:0 0 27px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Your complete proposal is attached as a PDF for your
                review. You can also review the proposal online using
                the button below.
              </p>

              <!-- PROPOSAL SUMMARY -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  background-color:#f7f9fc;
                  border:1px solid #e2e8f0;
                  border-radius:9px;
                "
              >
                <tr>
                  <td style="padding:23px 22px;">

                    <p style="
                      margin:0 0 7px;
                      color:#7b8798;
                      font-size:11px;
                      line-height:17px;
                      font-weight:700;
                      letter-spacing:1px;
                    ">
                      PROPOSAL REFERENCE
                    </p>

                    <p style="
                      margin:0;
                      color:#17365d;
                      font-size:17px;
                      line-height:25px;
                      font-weight:700;
                      overflow-wrap:anywhere;
                    ">
                      ${proposal.proposalNumber}
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td style="
                          padding-top:19px;
                          border-bottom:1px solid #e0e7f0;
                          font-size:1px;
                          line-height:1px;
                        ">
                          &nbsp;
                        </td>
                      </tr>
                    </table>

                    <p style="
                      margin:19px 0 6px;
                      color:#7b8798;
                      font-size:11px;
                      line-height:17px;
                      font-weight:700;
                      letter-spacing:1px;
                    ">
                      PROPOSED INVESTMENT
                    </p>

                    <p
                      class="proposal-amount"
                      style="
                        margin:0;
                        color:#17365d;
                        font-size:30px;
                        line-height:38px;
                        font-weight:700;
                        overflow-wrap:anywhere;
                      "
                    >
                      ₹ ${Number(proposal.grandTotal).toLocaleString("en-IN")}
                    </p>

                    <p style="
                      margin:8px 0 0;
                      color:#7b8798;
                      font-size:12px;
                      line-height:19px;
                    ">
                      Refer to the attached PDF for the complete
                      scope, pricing details and applicable terms.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- PRIMARY ACTION BUTTON -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:28px;"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#17365d"
                    style="border-radius:7px;"
                  >
                    <a
                      href="${acceptUrl}"
                      target="_blank"
                      class="cta-button"
                      style="
                        display:inline-block;
                        padding:15px 28px;
                        color:#ffffff;
                        font-family:Arial, Helvetica, sans-serif;
                        font-size:15px;
                        line-height:22px;
                        font-weight:700;
                        text-decoration:none;
                        border-radius:7px;
                      "
                    >
                      Review &amp; Accept Proposal &nbsp; &#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="
                margin:13px 0 0;
                color:#8a94a5;
                font-size:11px;
                line-height:18px;
                text-align:center;
              ">
                Click above to open your proposal securely online.
              </p>

              <!-- CLOSING -->
              <p style="
                margin:29px 0 16px;
                color:#586579;
                font-size:14px;
                line-height:25px;
              ">
                Should you have any questions or require any
                clarification, please reply to this email. Our team
                will be happy to assist you.
              </p>

              <p style="
                margin:0 0 18px;
                color:#586579;
                font-size:14px;
                line-height:24px;
              ">
                We look forward to the opportunity to work with you
                and build a successful partnership.
              </p>

              <p style="
                margin:0;
                color:#586579;
                font-size:13px;
                line-height:23px;
              ">
                Best regards,<br />
                <strong style="color:#17365d; font-size:14px;">
                  Team Inquiry Bazaar
                </strong><br />
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
              class="footer"
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

        <p style="
          max-width:620px;
          margin:16px auto 0;
          color:#98a2b3;
          font-size:10px;
          line-height:17px;
          text-align:center;
        ">
          Having trouble opening your proposal? Please contact
          our team for assistance.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
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
