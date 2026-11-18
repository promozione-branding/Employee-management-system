// app/api/workflow/[id]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workflow from '@/models/admin/Workflow';
import { getAuthUser } from '@/lib/getAuthUser';
import mongoose from 'mongoose';

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
