// app/api/track-employee-work/route.js
//
// GET work-log timeline.
// Query params: page, limit, from, to, userId, employeeId, clientId, action, search

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import EmployeeWorkLog from '@/models/admin/EmployeeWorkLog';
import { buildWorkLogQuery, resolveViewer } from '@/lib/employeeWorkQuery';

export async function GET(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });

        const params = new URL(req.url).searchParams;
        const page = Math.max(1, Number(params.get('page')) || 1);
        const limit = Math.min(100, Math.max(10, Number(params.get('limit')) || 30));
        const query = buildWorkLogQuery(params, viewer);

        const [data, total] = await Promise.all([
            EmployeeWorkLog.find(query)
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            EmployeeWorkLog.countDocuments(query),
        ]);

        return NextResponse.json({ success: true, data, total, page, pages: Math.ceil(total / limit), canViewAll: viewer.canViewAll });
    } catch (error) {
        console.error('[track-employee-work] GET failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to fetch work history' }, { status: 500 });
    }
}
