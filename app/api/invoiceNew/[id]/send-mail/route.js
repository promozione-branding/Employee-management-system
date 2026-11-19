// app/api/invoiceNew/[id]/send-mail/route.js
// Send a generated invoice to the client by email (same pattern as the
// proposal send-mail): To = client email (or a custom address chosen in the
// UI), CC = all admin users. Marks a draft invoice as sent.

import { connectDB } from '@/lib/db';
import InvoiceNew from '@/models/admin/invoiceNew/InvoiceNew';
import User from '@/models/admin/User';
import { getAuthUser } from '@/lib/getAuthUser';
import { buildInvoiceCcList } from '@/lib/invoiceNew';
import { NextResponse } from 'next/server';
import { getTransporter, MAIL_FROM } from '@/lib/mailerNew';
import { PIB_LOGO_IN_Raw_Base_64 } from '@/app/constants/logo';
import mongoose from 'mongoose';

const LOGO_CID = 'inquiry-bazaar-invoice-logo';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const esc = (value = '') =>
    String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const getLogoAttachment = () => {
    const logo = PIB_LOGO_IN_Raw_Base_64;
    const match = logo.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,([\s\S]*)$/);
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

const inr = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const buildInvoiceEmail = ({ clientName, company, invoice }) => {
    const rows = (invoice.items || [])
        .map(
            (it, i) => `
            <tr>
                <td style="font-size:13px;color:#334155;padding:7px 0;">${i + 1}. ${esc(it.label)}${it.categoryLabel ? ` <span style="color:#94a3b8;">(${esc(it.categoryLabel)})</span>` : ''}</td>
                <td align="right" style="font-size:13px;color:#102b4e;font-weight:600;padding:7px 0;">&#8377; ${inr(it.amount - Number(it.serviceDiscount || 0))}</td>
            </tr>`
        )
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>Your Invoice from Inquiry Bazaar</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:35px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.07);">
                <tr>
                    <td align="center" style="background-color:#102b4e;padding:32px 24px;border-bottom:4px solid #e8a83e;">
                        <img src="cid:${LOGO_CID}" alt="Inquiry Bazaar" width="190" style="display:block;width:190px;max-width:100%;height:auto;border:0;margin:0 auto;" />
                        <p style="color:#dbeafe;font-size:12px;letter-spacing:2px;margin:15px 0 0;text-transform:uppercase;">Your Growth Partner</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:38px 32px 25px;">
                        <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">
                            Dear <strong>${esc(clientName || 'Client')}</strong>${company ? ` - ${esc(company)}` : ''},
                        </p>
                        <h1 style="color:#102b4e;font-size:25px;line-height:1.35;margin:0 0 18px;font-weight:700;">Your Invoice Is Ready!</h1>
                        <p style="font-size:15px;line-height:1.8;color:#64748b;margin:0 0 28px;">
                            Please find your invoice from <strong style="color:#102b4e;">Inquiry Bazaar Pvt. Ltd.</strong> below.
                            ${invoice.proposalNumber ? `It is generated against proposal <strong style="color:#102b4e;">${esc(invoice.proposalNumber)}</strong>.` : ''}
                            Request you to process the payment at the earliest.
                        </p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                            <tr>
                                <td style="padding:22px 24px 8px;">
                                    <p style="margin:0;font-size:11px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">Invoice Summary</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:12px 24px 8px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="font-size:14px;color:#64748b;padding:8px 0;">Invoice Number</td>
                                            <td align="right" style="font-size:14px;color:#102b4e;font-weight:700;padding:8px 0;">${esc(invoice.invoiceNumber || 'N/A')}</td>
                                        </tr>
                                        ${rows}
                                        <tr>
                                            <td colspan="2" style="border-top:1px solid #e2e8f0;font-size:0;line-height:0;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size:14px;color:#64748b;padding:14px 0 6px;">Total Payable</td>
                                            <td align="right" style="font-size:21px;color:#102b4e;font-weight:700;padding:14px 0 6px;">&#8377; ${inr(invoice.grandTotal)}</td>
                                        </tr>
                                        ${
                                            invoice.dueDate
                                                ? `<tr><td style="font-size:13px;color:#64748b;padding:0 0 18px;">Due Date</td><td align="right" style="font-size:13px;color:#b45309;font-weight:700;padding:0 0 18px;">${esc(new Date(invoice.dueDate).toLocaleDateString('en-IN'))}</td></tr>`
                                                : ''
                                        }
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size:13px;line-height:1.7;color:#94a3b8;margin:22px 0 0;">
                            The detailed tax invoice (with GST, bank details and payment schedule) is available with our team and in your invoice copy.
                            For any query, reply to this email or call us on 011 4260 3232.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:26px 24px;text-align:center;">
                        <p style="margin:0;color:#102b4e;font-size:15px;font-weight:700;">Inquiry Bazaar Private Limited</p>
                        <p style="margin:9px 0 0;font-size:13px;color:#64748b;">Your Trusted Digital Growth Partner</p>
                        <p style="margin:13px 0 0;font-size:13px;color:#64748b;">
                            <a href="tel:01142603232" style="color:#64748b;text-decoration:none;">011 4260 3232</a>
                        </p>
                        <p style="margin:18px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">
                            This email was sent regarding your invoice from Inquiry Bazaar Pvt. Ltd.
                            <br />&copy; ${new Date().getFullYear()} Inquiry Bazaar. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>`;
};

export async function POST(req, { params }) {
    try {
        await connectDB();

        const authUser = await getAuthUser(req);
        if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: 'Invalid request payload' }, { status: 400 });
        }

        const targetEmail = typeof body.email === 'string' ? body.email.trim() : '';
        if (!targetEmail) return NextResponse.json({ success: false, message: 'Target email required' }, { status: 400 });
        if (!isValidEmail(targetEmail)) return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 });

        const invoice = await InvoiceNew.findById(id).populate({ path: 'clientId', select: 'name company email phone' });
        if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
        if (!invoice.clientId) return NextResponse.json({ success: false, message: 'Client data missing' }, { status: 400 });
        if (invoice.status === 'cancelled') return NextResponse.json({ success: false, message: 'Cannot send a cancelled invoice' }, { status: 400 });

        // CC every admin (same lookup as client-creation notifications).
        const admins = await User.find({ role: 'admin' }).select('email');
        const cc = buildInvoiceCcList(
            admins.map((a) => a.email),
            targetEmail
        );

        const html = buildInvoiceEmail({ clientName: invoice.clientId.name, company: invoice.clientId.company, invoice });

        const transporter = getTransporter();
        await transporter.sendMail({
            from: MAIL_FROM,
            to: targetEmail,
            ...(cc.length ? { cc } : {}),
            subject: `Invoice ${invoice.invoiceNumber} from Inquiry Bazaar`,
            html,
            attachments: [getLogoAttachment()],
        });

        if (invoice.status === 'draft') invoice.status = 'sent';
        invoice.sentAt = new Date();
        invoice.sentToEmail = targetEmail;
        await invoice.save();

        return NextResponse.json({ success: true, message: `Invoice sent to ${targetEmail}${cc.length ? ` (CC: ${cc.join(', ')})` : ''}`, data: { status: invoice.status, sentAt: invoice.sentAt } }, { status: 200 });
    } catch (error) {
        console.log('sendInvoiceMail error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
