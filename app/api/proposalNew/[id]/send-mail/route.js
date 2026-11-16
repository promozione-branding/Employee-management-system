
// app/api/proposalNew/[id]/send-mail/route.js

import { connectDB } from '@/lib/db';
import ProposalNew from '@/models/admin/proposalNew/ProposalNew';
import { getAuthUser } from '@/lib/getAuthUser';
import { NextResponse } from 'next/server';
import { getTransporter, MAIL_FROM } from '@/lib/mailerNew';
import { PIB_LOGO_IN_Raw_Base_64 } from '@/app/constants/logo';
import crypto from 'crypto';
import mongoose from 'mongoose';

const LOGO_CID = 'inquiry-bazaar-proposal-logo';

// Email validation
const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Escape dynamic values before inserting them into HTML
const esc = (value = '') =>
    String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[char]);

// Convert Base64 logo into an inline email attachment
const getLogoAttachment = () => {
    const logo = PIB_LOGO_IN_Raw_Base_64;

    const match = logo.match(
        /^data:image\/([a-zA-Z0-9.+-]+);base64,([\s\S]*)$/
    );

    const base64Data = match ? match[2] : logo;
    const imageType = match ? match[1] : 'png';

    return {
        filename: `inquiry-bazaar-logo.${imageType === 'jpeg' ? 'jpg' : imageType}`,
        content: Buffer.from(base64Data, 'base64'),
        contentType: `image/${imageType}`,
        cid: LOGO_CID,
        contentDisposition: 'inline',
    };
};

// Build the proposal email HTML
const buildProposalEmail = ({
    clientName,
    company,
    proposalNumber,
    grandTotal,
    acceptUrl,
}) => {
    const safeName = esc(clientName || 'Client');
    const safeCompany = company ? esc(company) : '';
    const safeProposalNumber = esc(proposalNumber || 'N/A');
    const safeAcceptUrl = esc(acceptUrl);

    const formattedAmount = Number(grandTotal || 0).toLocaleString(
        'en-IN',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>Your Proposal from Inquiry Bazaar</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
">

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f1f5f9; padding: 35px 12px;"
>
    <tr>
        <td align="center">

            <!-- Main email container -->
            <table
                role="presentation"
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    width: 100%;
                    max-width: 600px;
                    background-color: #ffffff;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.07);
                "
            >

                <!-- Brand header -->
                <tr>
                    <td
                        align="center"
                        style="
                            background-color: #102b4e;
                            padding: 32px 24px;
                            border-bottom: 4px solid #e8a83e;
                        "
                    >
                        <img
                            src="cid:${LOGO_CID}"
                            alt="Inquiry Bazaar"
                            width="190"
                            style="
                                display: block;
                                width: 190px;
                                max-width: 100%;
                                height: auto;
                                border: 0;
                                margin: 0 auto;
                            "
                        />

                        <p style="
                            color: #dbeafe;
                            font-size: 12px;
                            letter-spacing: 2px;
                            margin: 15px 0 0;
                            text-transform: uppercase;
                        ">
                            Your Growth Partner
                        </p>
                    </td>
                </tr>

                <!-- Main content -->
                <tr>
                    <td style="padding: 38px 32px 25px;">

                        <p style="
                            font-size: 15px;
                            color: #334155;
                            margin: 0 0 20px;
                            line-height: 1.7;
                        ">
                            Dear <strong>${safeName}</strong>${safeCompany ? ` - ${safeCompany}` : ''},
                        </p>

                        <h1 style="
                            color: #102b4e;
                            font-size: 25px;
                            line-height: 1.35;
                            margin: 0 0 18px;
                            font-weight: 700;
                        ">
                            Your Proposal Is Ready!
                        </h1>

                        <p style="
                            font-size: 15px;
                            line-height: 1.8;
                            color: #64748b;
                            margin: 0 0 16px;
                        ">
                            We are pleased to share your proposal with you.
                            At <strong style="color: #102b4e;">Inquiry Bazaar Pvt. Ltd.</strong>,
                            we believe in delivering customized solutions
                            that align with your business goals.
                        </p>

                        <p style="
                            font-size: 15px;
                            line-height: 1.8;
                            color: #64748b;
                            margin: 0 0 28px;
                        ">
                            We appreciate the opportunity to work with you
                            and look forward to helping your brand achieve
                            its marketing objectives.
                        </p>

                        <!-- Proposal details card -->
                        <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                background-color: #f8fafc;
                                border: 1px solid #e2e8f0;
                                border-radius: 10px;
                            "
                        >
                            <tr>
                                <td style="padding: 22px 24px 8px;">

                                    <p style="
                                        margin: 0;
                                        font-size: 11px;
                                        color: #64748b;
                                        letter-spacing: 1.5px;
                                        text-transform: uppercase;
                                        font-weight: 700;
                                    ">
                                        Proposal Summary
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 12px 24px 8px;">

                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >
                                        <tr>
                                            <td style="
                                                font-size: 14px;
                                                color: #64748b;
                                                padding: 8px 0;
                                            ">
                                                Proposal Number
                                            </td>

                                            <td align="right" style="
                                                font-size: 14px;
                                                color: #102b4e;
                                                font-weight: 700;
                                                padding: 8px 0;
                                            ">
                                                ${safeProposalNumber}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colspan="2" style="
                                                border-top: 1px solid #e2e8f0;
                                                font-size: 0;
                                                line-height: 0;
                                            ">
                                                &nbsp;
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="
                                                font-size: 14px;
                                                color: #64748b;
                                                padding: 14px 0 18px;
                                            ">
                                                Total Amount
                                            </td>

                                            <td align="right" style="
                                                font-size: 21px;
                                                color: #102b4e;
                                                font-weight: 700;
                                                padding: 14px 0 18px;
                                            ">
                                                &#8377; ${formattedAmount}
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                        <!-- CTA section -->
                        <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="margin-top: 32px;"
                        >
                            <tr>
                                <td align="center">

                                    <a
                                        href="${safeAcceptUrl}"
                                        target="_blank"
                                        style="
                                            display: inline-block;
                                            background-color: #102b4e;
                                            color: #ffffff;
                                            text-decoration: none;
                                            padding: 16px 36px;
                                            border-radius: 7px;
                                            font-size: 15px;
                                            font-weight: 700;
                                            letter-spacing: 0.2px;
                                        "
                                    >
                                        View &amp; Accept Proposal
                                        &nbsp; &#8594;
                                    </a>

                                </td>
                            </tr>
                        </table>

                        <p style="
                            font-size: 13px;
                            line-height: 1.7;
                            color: #94a3b8;
                            text-align: center;
                            margin: 18px 0 0;
                        ">
                            Click the button above to view your complete
                            proposal and proceed with acceptance.
                        </p>

                        <!-- Direct link fallback -->
                        <p style="
                            font-size: 12px;
                            line-height: 1.7;
                            color: #94a3b8;
                            margin: 25px 0 0;
                            text-align: center;
                        ">
                            If the button doesn't work, copy and paste this
                            link into your browser:
                        </p>

                        <p style="
                            font-size: 12px;
                            line-height: 1.7;
                            text-align: center;
                            word-break: break-all;
                            margin: 8px 0 0;
                        ">
                            <a
                                href="${safeAcceptUrl}"
                                style="color: #2563eb; text-decoration: underline;"
                            >
                                ${safeAcceptUrl}
                            </a>
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="
                        background-color: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        padding: 26px 24px;
                        text-align: center;
                    ">

                        <p style="
                            margin: 0;
                            color: #102b4e;
                            font-size: 15px;
                            font-weight: 700;
                        ">
                            Inquiry Bazaar Private Limited
                        </p>

                        <p style="
                            margin: 9px 0 0;
                            font-size: 13px;
                            color: #64748b;
                        ">
                            Your Trusted Digital Growth Partner
                        </p>

                        <p style="
                            margin: 13px 0 0;
                            font-size: 13px;
                            color: #64748b;
                        ">
                            <a
                                href="tel:01142603232"
                                style="color: #64748b; text-decoration: none;"
                            >
                                011 4260 3232
                            </a>
                        </p>

                        <p style="
                            margin: 18px 0 0;
                            font-size: 11px;
                            line-height: 1.6;
                            color: #94a3b8;
                        ">
                            This email was sent regarding your proposal
                            from Inquiry Bazaar Pvt. Ltd.
                            <br />
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
`;
};

export async function POST(req, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUser(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid id' },
                { status: 400 }
            );
        }

        let body;

        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json(
                { success: false, message: 'Invalid request payload' },
                { status: 400 }
            );
        }

        const targetEmail = body.email;

        if (!targetEmail) {
            return NextResponse.json(
                { success: false, message: 'Target email required' },
                { status: 400 }
            );
        }

        // Backend email validation
        if (!isValidEmail(targetEmail)) {
            return NextResponse.json(
                { success: false, message: 'Invalid email format' },
                { status: 400 }
            );
        }

        const proposal = await ProposalNew.findById(id).populate({
            path: 'clientId',
            select: 'name company email phone',
        });

        if (!proposal) {
            return NextResponse.json(
                { success: false, message: 'Proposal not found' },
                { status: 404 }
            );
        }

        if (!proposal.clientId) {
            return NextResponse.json(
                { success: false, message: 'Client data missing' },
                { status: 400 }
            );
        }

        if (!proposal.acceptToken) {
            proposal.acceptToken = crypto.randomBytes(24).toString('hex');
        }

        proposal.status = 'sent';
        proposal.sentAt = new Date();
        proposal.sentToEmail = targetEmail;

        await proposal.save();

        // Prioritize Proposal_mail_URL
        const baseUrl = (
            process.env.Proposal_mail_URL ||
            process.env.APP_URL ||
            'http://localhost:3000'
        ).replace(/\/+$/, '');

        const acceptUrl =
            `${baseUrl}/proposal/accept-new/${encodeURIComponent(proposal.acceptToken)}`;

        // Generate email HTML
        const html = buildProposalEmail({
            clientName: proposal.clientId.name,
            company: proposal.clientId.company,
            proposalNumber: proposal.proposalNumber,
            grandTotal: proposal.grandTotal,
            acceptUrl,
        });

        // Send proposal email
        const transporter = getTransporter();

        await transporter.sendMail({
            from: MAIL_FROM,
            to: targetEmail,
            subject: `Proposal ${proposal.proposalNumber} from Inquiry Bazaar`,
            html,
            attachments: [getLogoAttachment()],
        });

        return NextResponse.json(
            { success: true, message: 'Proposal mail sent' },
            { status: 200 }
        );

    } catch (error) {
        console.log('sendProposalMail error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Server error',
            },
            { status: 500 }
        );
    }
}
