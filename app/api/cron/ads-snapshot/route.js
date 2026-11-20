import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { syncAdsSnapshot } from '@/lib/adsSnapshot';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const end = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const start = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    await connectDB();
    try { return NextResponse.json(await syncAdsSnapshot(start, end)); }
    catch (error) { return NextResponse.json({ ok: false, error: error.message }, { status: 500 }); }
}
