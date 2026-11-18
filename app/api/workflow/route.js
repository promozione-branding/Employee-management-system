// app/api/workflow/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workflow from '@/models/admin/Workflow';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        await connectDB();
        const authUser = await getAuthUser(req);
        if (!authUser?._id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ success: false, message: 'customerId required' }, { status: 400 });
        }

        // Fetch all workflows for this customer, newest first
        const list = await Workflow.find({ customerId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: list }, { status: 200 });
    } catch (error) {
        console.error('❌ [workflow GET] error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
