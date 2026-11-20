import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import ReportClient from '@/models/admin/ReportClient';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import { syncAdsSnapshot } from '@/lib/adsSnapshot';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req) {
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const params = new URL(req.url).searchParams;
    const from = params.get('from') || new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    const to = params.get('to') || new Date().toISOString().slice(0, 10);
    const query = (params.get('q') || '').trim();
    const platform = params.get('platform');
    const clientId = params.get('clientId');
    const filter = { date: { $gte: from, $lte: to } };
    if (['google', 'meta'].includes(platform)) filter.platform = platform;
    if (clientId?.startsWith('account|')) {
        const [, accountPlatform, accountId] = clientId.split('|');
        filter.platform = accountPlatform;
        filter.accountId = accountId;
    } else if (clientId) filter.clientId = clientId;
    if (query) filter.$or = ['clientName', 'accountId', 'campaign', 'adGroup', 'entity', 'keyword'].map((key) => ({ [key]: { $regex: query, $options: 'i' } }));
    const [rows, clientList, unassignedAccounts] = await Promise.all([
        AdPerformanceDaily.find(filter).sort({ date: -1, spend: -1 }).limit(5000).lean(),
        ReportClient.find({ status: 'active' }).select('_id name').sort({ name: 1 }).lean(),
        AdPerformanceDaily.aggregate([
            { $match: { clientId: null } },
            { $group: { _id: { platform: '$platform', accountId: '$accountId' }, name: { $first: '$clientName' } } },
            { $sort: { name: 1 } },
        ]),
    ]);
    const clients = [...clientList, ...unassignedAccounts.map((account) => ({ _id: `account|${account._id.platform}|${account._id.accountId}`, name: `${account.name} · ${account._id.platform === 'google' ? 'Google Ads' : 'Meta Ads account'}` }))];
    // Use campaign rows for summary totals; ad group/ad/keyword rows are nested
    // breakdowns and summing every level would count spend multiple times.
    const totals = rows.filter((r) => r.level === 'campaign').reduce((a, r) => {
        a.spend += r.spend || 0; a.clicks += r.clicks || 0; a.impressions += r.impressions || 0; a.conversions += r.conversions || 0;
        return a;
    }, { spend: 0, clicks: 0, impressions: 0, conversions: 0 });
    return Response.json({ rows, clients, totals, refreshedAt: rows.reduce((latest, row) => !latest || row.updatedAt > latest ? row.updatedAt : latest, null) });
}

export async function POST(req) {
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const end = body.to || new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const start = body.from || end;
    const span = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || span < 0 || span > 30)
        return Response.json({ error: 'Choose a valid date range of up to 31 days.' }, { status: 400 });
    return Response.json(await syncAdsSnapshot(start, end));
}
