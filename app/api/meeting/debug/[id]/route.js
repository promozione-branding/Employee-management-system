// app/api/meeting/debug/[id]/route.js
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import Meeting from '@/models/admin/meeting/Meeting';

export async function GET(req, context) {
    console.log('🐛 [debug] params raw:', context?.params);

    // Next.js 15 — params is a Promise
    const params = await context.params;
    const id = params?.id;

    console.log('🐛 [debug] resolved id:', id);

    if (!id) {
        return NextResponse.json({ success: false, message: 'id missing in URL' }, { status: 400 });
    }

    await connectDB();

    let m;
    try {
        m = await Meeting.findById(id).lean();
    } catch (err) {
        console.log('🐛 [debug] findById error:', err.message);
        return NextResponse.json(
            { success: false, message: 'findById failed', error: err.message },
            { status: 500 }
        );
    }

    if (!m) {
        return NextResponse.json({ success: false, message: 'Meeting not found', id }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        meetingId: m._id,
        totalUpdates: (m.meetingUpdate || []).length,
        meetingUpdate: (m.meetingUpdate || []).map((u) => ({
            _id: u._id,
            updateType: u.updateType,
            createdAt: u.createdAt,
            hasLocation: !!u.location,
            location: u.location || null,
        })),
    });
}
