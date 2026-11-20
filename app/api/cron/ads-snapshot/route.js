import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { syncAdsSnapshot } from '@/lib/adsSnapshot';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function istDateDaysAgo(days) {
    const ist = new Date(Date.now() + 330 * 60 * 1000);
    const date = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - days));
    return date.toISOString().slice(0, 10);
}

export async function GET(req) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const end = istDateDaysAgo(1);
    const start = istDateDaysAgo(3);
    await connectDB();
    try { return NextResponse.json(await syncAdsSnapshot(start, end)); }
    catch (error) { return NextResponse.json({ ok: false, error: error.message }, { status: 500 }); }
}
