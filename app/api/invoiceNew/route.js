// app/api/invoiceNew/route.js
// List invoices for a client, and generate a new invoice from a proposal.
// Generation snapshots the proposal's offerings + totals server-side, so an
// invoice can never drift from the proposal it was generated from.

import { connectDB } from '@/lib/db';
import InvoiceNew from '@/models/admin/invoiceNew/InvoiceNew';
import ProposalNew from '@/models/admin/proposalNew/ProposalNew';
import { buildInvoiceFromProposal } from '@/lib/invoiceNew';
import { getAuthUser } from '@/lib/getAuthUser';
import { resolveUserName } from '@/lib/resolveUserName';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const CLIENT_SELECT = 'name company phone email GSTIN tanNo Address city state country pincode';

export async function GET(req) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const clientId = new URL(req.url).searchParams.get('clientId');
        if (!clientId) return NextResponse.json({ success: false, message: 'clientId required' }, { status: 400 });

        const list = await InvoiceNew.find({ clientId }).populate({ path: 'clientId', select: CLIENT_SELECT }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: list }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { proposalId, clientId, invoiceDate, dueDate, notes, status } = body || {};

        if (!proposalId || !mongoose.Types.ObjectId.isValid(proposalId)) {
            return NextResponse.json({ success: false, message: 'Valid proposalId required' }, { status: 400 });
        }

        const proposal = await ProposalNew.findById(proposalId).lean();
        if (!proposal) return NextResponse.json({ success: false, message: 'Proposal not found' }, { status: 404 });
        if (clientId && String(proposal.clientId) !== String(clientId)) {
            return NextResponse.json({ success: false, message: 'Proposal does not belong to this client' }, { status: 400 });
        }

        let data;
        try {
            data = buildInvoiceFromProposal(proposal, { invoiceDate, dueDate, notes, status });
        } catch (err) {
            return NextResponse.json({ success: false, message: err.message }, { status: 400 });
        }

        const doc = await InvoiceNew.create({
            ...data,
            clientId: proposal.clientId,
            proposalId: proposal._id,
            invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            createdByName: await resolveUserName(authUser),
        });

        const populated = await InvoiceNew.findById(doc._id).populate({ path: 'clientId', select: CLIENT_SELECT });
        return NextResponse.json({ success: true, data: populated, message: `Invoice ${doc.invoiceNumber} generated from ${proposal.proposalNumber}` }, { status: 201 });
    } catch (error) {
        console.error('Generate invoice error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
