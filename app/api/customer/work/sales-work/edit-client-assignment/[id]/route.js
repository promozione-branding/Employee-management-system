// app/api/customer/work/sales-work/edit-client-assignment/[id]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import { recordEmployeeWork } from '@/lib/employeeWorkTracker';

export async function PATCH(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();

        const { salesExecutive } = body;

        if (!salesExecutive) {
            return NextResponse.json({ success: false, message: 'Sales executive is required' }, { status: 400 });
        }

        const before = await Customer.findById(id).select('salesExecutive').lean();
        await Customer.findByIdAndUpdate(id, { salesExecutive }, { new: true });

        const newIds = (Array.isArray(salesExecutive) ? salesExecutive : [salesExecutive]).map(String);
        await recordEmployeeWork({
            req,
            clientId: id,
            action: 'SALES_EXECUTIVE_CHANGED',
            summary: 'Changed sales executive assignment',
            details: { employeeIds: newIds, changes: [{ field: 'salesExecutive', oldValue: [].concat(before?.salesExecutive || []).map(String), newValue: newIds }] },
            entityType: 'Customer',
            entityId: id,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Sales executive updated successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
