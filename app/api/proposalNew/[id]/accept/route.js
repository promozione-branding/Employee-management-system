
import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { NextResponse } from "next/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailerNew";
import { PIB_LOGO_IN_Raw_Base_64 } from "@/app/constants/logo";
import mongoose from "mongoose";

// ------------------------------------------------------
// BRAND CONFIGURATION
// ------------------------------------------------------

const BRAND = {
    primary: "#0F766E",
    primaryDark: "#115E59",
    navy: "#102A43",
    text: "#334155",
    muted: "#64748B",
    border: "#E2E8F0",
    background: "#F1F5F9",
};

const LOGO_CID = "inquiry-bazaar-proposal-logo";

// ------------------------------------------------------
// HTML ESCAPING
// ------------------------------------------------------

function esc(value) {
    return String(value ?? "").replace(/[<>&"]/g, (char) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
    })[char]);
}

// ------------------------------------------------------
// BASE64 LOGO ATTACHMENT
// ------------------------------------------------------

function getLogoAttachment() {
    const logo = PIB_LOGO_IN_Raw_Base_64;

    const match = logo.match(
        /^data:image\/([a-zA-Z0-9.+-]+);base64,([\s\S]*)$/
    );

    const imageType = match ? match[1] : "png";
    const base64Data = match ? match[2] : logo;

    return {
        filename: `inquiry-bazaar-logo.${imageType}`,
        content: Buffer.from(base64Data, "base64"),
        contentType: match ? `image/${imageType}` : "image/png",
        cid: LOGO_CID,
        contentDisposition: "inline",
    };
}

// ------------------------------------------------------
// REUSABLE EMAIL TEMPLATE
// ------------------------------------------------------

function buildAcceptanceEmail({
    clientName,
    proposalNumber,
    viewUrl,
    paymentUrl,
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <title>Proposal Accepted</title>
    </head>

    <body style="
        margin:0;
        padding:0;
        background-color:${BRAND.background};
        font-family:Arial,Helvetica,sans-serif;
        color:${BRAND.text};
    ">

        <!-- PREHEADER -->

        <div style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
            color:transparent;
        ">
            Your proposal has been successfully accepted.
            Thank you for choosing Inquiry Bazaar.
        </div>

        <table role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
                width:100%;
                background-color:${BRAND.background};
                padding:35px 12px;
            ">

            <tr>
                <td align="center">

                    <!-- MAIN CONTAINER -->

                    <table role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            max-width:650px;
                            width:100%;
                            background:#FFFFFF;
                            border:1px solid ${BRAND.border};
                            border-radius:14px;
                            overflow:hidden;
                        ">

                        <!-- BRAND HEADER -->

                        <tr>
                            <td style="
                                background:${BRAND.navy};
                                padding:25px 30px;
                            ">

                                <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0">

                                    <tr>
                                        <td align="left" valign="middle">

                                            <table role="presentation"
                                                cellpadding="0"
                                                cellspacing="0"
                                                style="
                                                    background:#FFFFFF;
                                                    border-radius:7px;
                                                    padding:8px;
                                                ">
                                                <tr>
                                                    <td>
                                                        <img
                                                            src="cid:${LOGO_CID}"
                                                            alt="Inquiry Bazaar"
                                                            width="190"
                                                            style="
                                                                display:block;
                                                                width:190px;
                                                                max-width:190px;
                                                                height:auto;
                                                                border:0;
                                                            "
                                                        />
                                                    </td>
                                                </tr>
                                            </table>

                                            <div style="
                                                margin-top:10px;
                                                color:#CBD5E1;
                                                font-size:10px;
                                                font-weight:600;
                                                letter-spacing:1.8px;
                                            ">
                                                BUSINESS MANAGEMENT SYSTEM
                                            </div>

                                        </td>

                                        <td align="right" valign="middle">

                                            <span style="
                                                display:inline-block;
                                                background:#0F766E;
                                                color:#FFFFFF;
                                                padding:8px 12px;
                                                border-radius:20px;
                                                font-size:10px;
                                                font-weight:700;
                                                letter-spacing:0.6px;
                                            ">
                                                CONFIRMED
                                            </span>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- SUCCESS BANNER -->

                        <tr>
                            <td style="
                                padding:38px 30px 28px;
                                text-align:center;
                            ">

                                <table role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                    align="center"
                                    style="margin:0 auto 20px;">

                                    <tr>
                                        <td align="center"
                                            valign="middle"
                                            width="76"
                                            height="76"
                                            style="
                                                width:76px;
                                                height:76px;
                                                background:#CCFBF1;
                                                border-radius:50%;
                                                color:#0F766E;
                                                font-size:38px;
                                                font-weight:bold;
                                                text-align:center;
                                                line-height:76px;
                                            ">
                                            &#10003;
                                        </td>
                                    </tr>

                                </table>

                                <div style="
                                    color:${BRAND.primary};
                                    font-size:11px;
                                    font-weight:800;
                                    letter-spacing:2px;
                                    margin-bottom:12px;
                                ">
                                    PROPOSAL CONFIRMATION
                                </div>

                                <h1 style="
                                    margin:0;
                                    color:${BRAND.navy};
                                    font-size:29px;
                                    line-height:1.3;
                                    font-weight:800;
                                    letter-spacing:-0.7px;
                                ">
                                    Proposal Accepted!
                                </h1>

                                <p style="
                                    margin:13px auto 0;
                                    max-width:440px;
                                    color:${BRAND.muted};
                                    font-size:14px;
                                    line-height:1.8;
                                ">
                                    Congratulations! Your proposal has been
                                    successfully accepted. We're excited to
                                    begin this journey with you.
                                </p>

                            </td>
                        </tr>

                        <!-- CLIENT GREETING -->

                        <tr>
                            <td style="padding:0 30px 25px;">

                                <div style="
                                    border-top:1px solid ${BRAND.border};
                                    padding-top:25px;
                                    color:${BRAND.text};
                                    font-size:14px;
                                    line-height:1.8;
                                ">
                                    Dear <strong style="color:${BRAND.navy};">
                                        ${esc(clientName)}
                                    </strong>,
                                    <br><br>

                                    Thank you for placing your trust in
                                    <strong>Inquiry Bazaar</strong>.

                                    We are pleased to confirm that you have
                                    accepted our proposal. Your confirmation
                                    has been successfully recorded in our system.
                                </div>

                            </td>
                        </tr>

                        <!-- PROPOSAL DETAILS CARD -->

                        <tr>
                            <td style="padding:0 30px 28px;">

                                <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="
                                        background:#F8FAFC;
                                        border:1px solid ${BRAND.border};
                                        border-radius:10px;
                                    ">

                                    <tr>
                                        <td style="
                                            padding:20px 22px;
                                        ">

                                            <div style="
                                                color:${BRAND.muted};
                                                font-size:11px;
                                                font-weight:800;
                                                letter-spacing:1.2px;
                                                margin-bottom:12px;
                                            ">
                                                ACCEPTED PROPOSAL DETAILS
                                            </div>

                                            <div style="
                                                color:${BRAND.navy};
                                                font-size:21px;
                                                font-weight:800;
                                                word-break:break-word;
                                            ">
                                                ${esc(proposalNumber)}
                                            </div>

                                            <div style="
                                                margin-top:12px;
                                                display:inline-block;
                                                color:#047857;
                                                background:#D1FAE5;
                                                padding:6px 11px;
                                                border-radius:20px;
                                                font-size:11px;
                                                font-weight:700;
                                            ">
                                                &#10003; ACCEPTED
                                            </div>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- ACTION SECTION -->

                        <tr>
                            <td style="
                                padding:0 30px 32px;
                            ">

                                <div style="
                                    color:${BRAND.navy};
                                    font-size:17px;
                                    font-weight:800;
                                    margin-bottom:9px;
                                ">
                                    What's Next?
                                </div>

                                <p style="
                                    margin:0 0 22px;
                                    color:${BRAND.muted};
                                    font-size:13px;
                                    line-height:1.7;
                                ">
                                    You can review your accepted proposal
                                    or proceed with the payment using
                                    the options below.
                                </p>

                                <!-- VIEW PROPOSAL BUTTON -->

                                <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="margin-bottom:13px;">

                                    <tr>
                                        <td align="center"
                                            bgcolor="${BRAND.primary}"
                                            style="
                                                background:${BRAND.primary};
                                                border-radius:8px;
                                            ">

                                            <a href="${esc(viewUrl)}"
                                                target="_blank"
                                                style="
                                                    display:block;
                                                    padding:16px 20px;
                                                    color:#FFFFFF;
                                                    text-decoration:none;
                                                    font-size:14px;
                                                    font-weight:700;
                                                    letter-spacing:0.2px;
                                                ">
                                                View Accepted Proposal
                                                &nbsp; &#8594;
                                            </a>

                                        </td>
                                    </tr>

                                </table>

                                <!-- PAYMENT BUTTON -->

                                <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0">

                                    <tr>
                                        <td align="center"
                                            bgcolor="#166534"
                                            style="
                                                background:#166534;
                                                border-radius:8px;
                                            ">

                                            <a href="${esc(paymentUrl)}"
                                                target="_blank"
                                                style="
                                                    display:block;
                                                    padding:16px 20px;
                                                    color:#FFFFFF;
                                                    text-decoration:none;
                                                    font-size:14px;
                                                    font-weight:700;
                                                    letter-spacing:0.2px;
                                                ">
                                                Proceed to Payment
                                                &nbsp; &#8594;
                                            </a>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- LINK BACKUP -->

                        <tr>
                            <td style="
                                padding:0 30px 30px;
                            ">

                                <table role="presentation"
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="
                                        background:#F8FAFC;
                                        border-radius:8px;
                                    ">

                                    <tr>
                                        <td style="padding:18px;">

                                            <div style="
                                                color:${BRAND.navy};
                                                font-size:12px;
                                                font-weight:700;
                                                margin-bottom:12px;
                                            ">
                                                Having trouble with the buttons?
                                            </div>

                                            <div style="
                                                color:${BRAND.muted};
                                                font-size:11px;
                                                line-height:1.8;
                                                word-break:break-all;
                                            ">
                                                <strong>Proposal:</strong>
                                                <br>
                                                <a href="${esc(viewUrl)}"
                                                    style="
                                                        color:${BRAND.primary};
                                                        text-decoration:underline;
                                                    ">
                                                    ${esc(viewUrl)}
                                                </a>

                                                <br><br>

                                                <strong>Payment:</strong>
                                                <br>
                                                <a href="${esc(paymentUrl)}"
                                                    style="
                                                        color:${BRAND.primary};
                                                        text-decoration:underline;
                                                    ">
                                                    ${esc(paymentUrl)}
                                                </a>

                                            </div>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- CLOSING MESSAGE -->

                        <tr>
                            <td style="
                                padding:0 30px 30px;
                            ">

                                <div style="
                                    color:${BRAND.text};
                                    font-size:13px;
                                    line-height:1.8;
                                ">
                                    We truly appreciate your business
                                    and look forward to building a
                                    successful partnership with you.

                                    <br><br>

                                    Warm regards,
                                    <br>

                                    <strong style="
                                        color:${BRAND.navy};
                                        font-size:14px;
                                    ">
                                        Team Inquiry Bazaar
                                    </strong>

                                </div>

                            </td>
                        </tr>

                        <!-- FOOTER -->

                        <tr>
                            <td style="
                                background:#F8FAFC;
                                border-top:1px solid ${BRAND.border};
                                padding:25px 30px;
                                text-align:center;
                            ">

                                <div style="
                                    color:${BRAND.navy};
                                    font-size:13px;
                                    font-weight:800;
                                ">
                                    INQUIRY BAZAAR PRIVATE LIMITED
                                </div>

                                <div style="
                                    margin-top:8px;
                                    color:${BRAND.muted};
                                    font-size:11px;
                                    line-height:1.8;
                                ">
                                    Thank you for choosing us as your
                                    business partner.

                                    <br>

                                    This is an automated confirmation
                                    email from Inquiry Bazaar.
                                </div>

                                <div style="
                                    margin-top:16px;
                                    padding-top:15px;
                                    border-top:1px solid ${BRAND.border};
                                    color:#94A3B8;
                                    font-size:10px;
                                ">
                                    © ${new Date().getFullYear()}
                                    Inquiry Bazaar. All rights reserved.
                                </div>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </body>
    </html>
    `;
}

// ------------------------------------------------------
// POST: ACCEPT PROPOSAL
// ------------------------------------------------------

export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid id",
                },
                { status: 400 }
            );
        }

        const { token } = await req.json();

        const proposal = await ProposalNew.findOne({
            _id: id,
            acceptToken: token,
        }).populate({
            path: "clientId",
            select: "name email",
        });

        if (!proposal) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid token",
                },
                { status: 404 }
            );
        }

        if (proposal.status === "accepted") {
            return NextResponse.json(
                {
                    success: true,
                    message: "Already accepted",
                },
                { status: 200 }
            );
        }

        // --------------------------------------------------
        // UPDATE PROPOSAL STATUS
        // --------------------------------------------------

        proposal.status = "accepted";
        proposal.acceptedAt = new Date();

        proposal.acceptedByEmail =
            proposal.sentToEmail ||
            proposal.clientId?.email ||
            "";

        await proposal.save();

        // --------------------------------------------------
        // EMAIL CONFIGURATION
        // --------------------------------------------------

        const baseUrl = (
            process.env.Proposal_mail_URL ||
            process.env.APP_URL ||
            "http://localhost:3000"
        ).replace(/\/+$/, "");

        const viewUrl =
            `${baseUrl}/proposal/view-new/${encodeURIComponent(token)}`;

        const paymentUrl = "https://pay.inquirybazaar.com/";

        // --------------------------------------------------
        // SEND THANK-YOU EMAIL
        // --------------------------------------------------

        try {
            const transporter = getTransporter();

            const mainRecipient =
                proposal.sentToEmail ||
                proposal.clientId?.email;

            if (!mainRecipient) {
                throw new Error("No recipient email found.");
            }

            const ccEmails = new Set();

            if (process.env.YOUR_EMAIL_ADDRESS) {
                ccEmails.add(process.env.YOUR_EMAIL_ADDRESS);
            }

            if (
                proposal.clientId?.email &&
                proposal.clientId.email !== mainRecipient
            ) {
                ccEmails.add(proposal.clientId.email);
            }

            const clientName =
                proposal.clientId?.name || "Client";

            const proposalNumber =
                proposal.proposalNumber || "N/A";

            const html = buildAcceptanceEmail({
                clientName,
                proposalNumber,
                viewUrl,
                paymentUrl,
            });

            const mailOptions = {
                from: MAIL_FROM,
                to: mainRecipient,
                cc: ccEmails.size > 0
                    ? Array.from(ccEmails).join(", ")
                    : undefined,
                subject: `Welcome to Inquiry Bazaar — Proposal Accepted`,
                html,
                attachments: [
                    getLogoAttachment(),
                ],
            };

            await transporter.sendMail(mailOptions);

        } catch (mailErr) {
            console.log("Thank-you mail error:", mailErr);
        }

        // --------------------------------------------------
        // SUCCESS RESPONSE
        // --------------------------------------------------

        return NextResponse.json(
            {
                success: true,
                message: "Proposal accepted",
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("acceptProposal error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}
