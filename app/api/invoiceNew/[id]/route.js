// app/api/invoiceNew/[id]/route.js
// Get / update / delete one generated invoice. Offerings and totals are an
// immutable snapshot — edits cover notes, dates, payment method and status
// only, and every edit is recorded in editHistory (latest 4, like proposals).

import { connectDB } from '@/lib/db';
import InvoiceNew from '@/models/admin/invoiceNew/InvoiceNew';
import { getAuthUser } from '@/lib/getAuthUser';
import { resolveUserName } from '@/lib/resolveUserName';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const CLIENT_SELECT = 'name company phone email GSTIN tanNo Address city state country pincode';
const STATUSES = ['draft', 'sent', 'paid', 'cancelled'];

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });

        const doc = await InvoiceNew.findById(id).populate({ path: 'clientId', select: CLIENT_SELECT });
        if (!doc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: doc }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });

        const existing = await InvoiceNew.findById(id);
        if (!existing) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        const body = await req.json();
        if (body.status !== undefined && !STATUSES.includes(body.status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        for (const field of ['notes', 'paymentMethod']) {
            if (typeof body[field] === 'string') existing[field] = body[field];
        }
        if (body.status !== undefined) existing.status = body.status;
        if (body.invoiceDate) existing.invoiceDate = new Date(body.invoiceDate);
        if (body.dueDate !== undefined) existing.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;

        existing.editHistory = [{ editedByName: await resolveUserName(authUser), editedAt: new Date() }, ...(existing.editHistory || [])].slice(0, 4);
        await existing.save();

        const populated = await InvoiceNew.findById(id).populate({ path: 'clientId', select: CLIENT_SELECT });
        return NextResponse.json({ success: true, data: populated }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });

        const doc = await InvoiceNew.findByIdAndDelete(id);
        if (!doc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: `${doc.invoiceNumber} deleted` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
