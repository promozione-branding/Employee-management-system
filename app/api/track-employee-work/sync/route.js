// app/api/track-employee-work/sync/route.js
//
// POST (admin only) imports past work from existing records into the permanent work log.
// Body: { dryRun?: boolean }. Safe to run repeatedly; nothing is ever duplicated.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { resolveViewer } from '@/lib/employeeWorkQuery';
import { syncEmployeeWorkHistory } from '@/lib/employeeWorkBackfill';

export async function POST(req) {
    try {
        await connectDB();
        const viewer = await resolveViewer(req);
        if (viewer.error) return NextResponse.json({ success: false, message: viewer.error.message }, { status: viewer.error.status });
        if (!viewer.isAdmin) return NextResponse.json({ success: false, message: 'Only admins can import work history' }, { status: 403 });

        const body = await req.json().catch(() => ({}));
        const result = await syncEmployeeWorkHistory({ dryRun: body?.dryRun === true });
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[track-employee-work/sync] POST failed:', error);
        return NextResponse.json({ success: false, message: 'Unable to import work history' }, { status: 500 });
    }
}
