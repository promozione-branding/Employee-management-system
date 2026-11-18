// app/api/workflow/[id]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workflow from '@/models/admin/Workflow';
import { getAuthUser } from '@/lib/getAuthUser';
import mongoose from 'mongoose';

// DELETE (existing)
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser?._id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
        }

        await Workflow.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Workflow deleted' }, { status: 200 });
    } catch (error) {
        console.error('❌ [workflow DELETE] error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// PUT (new — for editing)
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser?._id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
        }

        const body = await req.json();
        const { category, categoryLabel, description, startDate, endDate, duration } = body;

        if (!category || !startDate || !endDate) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        if (new Date(endDate) < new Date(startDate)) {
            return NextResponse.json({ success: false, message: 'End date cannot be before start date' }, { status: 400 });
        }

        const updated = await Workflow.findByIdAndUpdate(
            id,
            {
                category,
                categoryLabel,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                duration,
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Workflow not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error) {
        console.error('❌ [workflow PUT] error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
