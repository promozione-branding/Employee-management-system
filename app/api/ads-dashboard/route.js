import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import ReportClient from '@/models/admin/ReportClient';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import AdSnapshotCoverage from '@/models/admin/AdSnapshotCoverage';
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
    const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
    if (Number.isFinite(span) && span >= 0 && span <= 120 && !query) {
        const selectedAccount = clientId?.startsWith('account|') ? clientId.split('|') : null;
        const relevantClients = clientId && !selectedAccount
            ? [await ReportClient.findById(clientId).select('googleAdsCustomerIds metaAdAccountIds').lean()].filter(Boolean)
            : await ReportClient.find({ status: 'active' }).select('googleAdsCustomerIds metaAdAccountIds').lean();
        const backfillPlatforms = selectedAccount ? [selectedAccount[1]] : ['google', 'meta'].filter((name) => !['google', 'meta'].includes(platform) || name === platform);
        const missingRanges = new Map();
        for (const accountPlatform of backfillPlatforms) {
            const mappedIds = relevantClients.flatMap((client) => accountPlatform === 'google' ? client.googleAdsCustomerIds || [] : client.metaAdAccountIds || []);
            const savedIdFilter = { platform: accountPlatform };
            if (clientId && !selectedAccount) savedIdFilter.clientId = clientId;
            const savedIds = await AdPerformanceDaily.distinct('accountId', savedIdFilter);
            const accountIds = selectedAccount ? [selectedAccount[2]] : [...new Set([...mappedIds.map(String), ...savedIds.map(String)])];
            if (!accountIds.length) continue;
            const coverage = await AdSnapshotCoverage.aggregate([
                { $match: { platform: accountPlatform, accountId: { $in: accountIds }, date: { $gte: from, $lte: to } } },
                { $group: { _id: { accountId: '$accountId', date: '$date' } } },
            ]);
            const covered = new Set(coverage.map((item) => `${item._id.accountId}:${item._id.date}`));
            const cursor = new Date(`${from}T00:00:00Z`);
            const end = new Date(`${to}T00:00:00Z`);
            const missing = [];
            for (let count = 0; cursor <= end && count <= 120; count += 1) {
                const day = cursor.toISOString().slice(0, 10);
                if (accountIds.some((accountId) => !covered.has(`${accountId}:${day}`))) missing.push(day);
                cursor.setUTCDate(cursor.getUTCDate() + 1);
            }
            for (let index = 0; index < missing.length;) {
                let endIndex = index;
                while (endIndex + 1 < missing.length && (Date.parse(`${missing[endIndex + 1]}T00:00:00Z`) - Date.parse(`${missing[index]}T00:00:00Z`)) / 86400000 < 31) endIndex += 1;
                const rangeStart = missing[index], rangeEnd = missing[endIndex];
                missingRanges.set(`${rangeStart}:${rangeEnd}`, [rangeStart, rangeEnd]);
                index = endIndex + 1;
            }
        }
        // Fill absent days from the connected ad APIs. Keep each request to a
        // contiguous range so unrelated saved days are not fetched again.
        for (const [rangeStart, rangeEnd] of missingRanges.values()) {
            try {
                await syncAdsSnapshot(rangeStart, rangeEnd);
            } catch (error) {
                console.error('Ads dashboard missing-date backfill failed:', error.message);
                break;
            }
        }
    }
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || span < 0 || span > 365)
        return Response.json({ error: 'Choose a valid date range of up to 366 days.' }, { status: 400 });
    const results = [];
    for (let cursor = new Date(`${start}T00:00:00Z`), final = new Date(`${end}T00:00:00Z`); cursor <= final;) {
        const chunkStart = cursor.toISOString().slice(0, 10);
        // Advance using day arithmetic across month/year boundaries.
        const chunkEndDate = new Date(`${chunkStart}T00:00:00Z`);
        chunkEndDate.setUTCDate(chunkEndDate.getUTCDate() + 30);
        const chunkEnd = chunkEndDate > final ? end : chunkEndDate.toISOString().slice(0, 10);
        results.push(await syncAdsSnapshot(chunkStart, chunkEnd));
        cursor = new Date(`${chunkEnd}T00:00:00Z`);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return Response.json(results.reduce((total, result) => ({
        ...total,
        saved: total.saved + (result.saved || 0),
        accountsDiscovered: { google: Math.max(total.accountsDiscovered.google, result.accountsDiscovered?.google || 0), meta: Math.max(total.accountsDiscovered.meta, result.accountsDiscovered?.meta || 0) },
        accountsSynced: { google: total.accountsSynced.google + (result.accountsSynced?.google || 0), meta: total.accountsSynced.meta + (result.accountsSynced?.meta || 0) },
        errors: [...total.errors, ...(result.errors || [])],
    }), { ok: true, saved: 0, accountsDiscovered: { google: 0, meta: 0 }, accountsSynced: { google: 0, meta: 0 }, errors: [] }));
}
