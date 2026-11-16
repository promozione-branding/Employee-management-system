// app/api/proposalNew/[id]/accept/route.js

import { connectDB } from '@/lib/db';
import ProposalNew from '@/models/admin/proposalNew/ProposalNew';
import { NextResponse } from 'next/server';
import { getTransporter, MAIL_FROM } from '@/lib/mailerNew';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });

        const { token } = await req.json();
        const proposal = await ProposalNew.findOne({ _id: id, acceptToken: token }).populate({ path: 'clientId', select: 'name email' });

        if (!proposal) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 404 });
        if (proposal.status === 'accepted') return NextResponse.json({ success: true, message: 'Already accepted' }, { status: 200 });

        proposal.status = 'accepted';
        proposal.acceptedAt = new Date();
        proposal.acceptedByEmail = proposal.sentToEmail || proposal.clientId?.email || '';
        await proposal.save();

        const baseUrl = process.env.Proposal_mail_URL || process.env.APP_URL || 'http://localhost:3000';
        const viewUrl = `${baseUrl}/proposal/view-new/${token}`;

        try {
            const transporter = getTransporter();
            const mainRecipient = proposal.sentToEmail || proposal.clientId?.email;
            if (!mainRecipient) throw new Error('No recipient email found.');

            const ccEmails = new Set();
            if (process.env.YOUR_EMAIL_ADDRESS) ccEmails.add(process.env.YOUR_EMAIL_ADDRESS);
            if (proposal.clientId?.email && proposal.clientId.email !== mainRecipient) ccEmails.add(proposal.clientId.email);

            const mailOptions = {
                from: MAIL_FROM,
                to: mainRecipient,
                cc: ccEmails.size > 0 ? Array.from(ccEmails).join(', ') : undefined,
                subject: `Welcome to Inquiry Bazaar — Proposal Accepted`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <p>Dear ${proposal.clientId?.name || 'Client'},</p>
            <p>Thank you for accepting proposal <strong>${proposal.proposalNumber}</strong>.</p>
            <p>You can view your accepted proposal anytime using the link below:</p>
            <p style="margin: 18px 0;">
                <a href="${viewUrl}"
                   style="display: inline-block; background: #1e3a5f; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">
                    View Proposal PDF
                </a>
            </p>
            <p style="font-size: 12px; color: #6b7280;">Or copy this link into your browser:<br/>
                <a href="${viewUrl}" style="color: #2563eb;">${viewUrl}</a>
            </p>
            <p>Best regards,<br/>The Inquiry Bazaar</p></div>`,
            };

            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.log('Thank-you mail error:', mailErr);
        }

        return NextResponse.json({ success: true, message: 'Proposal accepted' }, { status: 200 });
    } catch (error) {
        console.log('acceptProposal error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}