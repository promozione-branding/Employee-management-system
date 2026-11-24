// app/api/ads-dashboard/overview/route.js
//
// One call that powers the ads dashboard. Everything is summed on the server, so
// totals stay correct however many daily rows exist (the older endpoint stops at
// 5,000 rows, which a 30-day all-clients view easily exceeds).
//
// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD&platform=google|meta&clientId=<id|account|platform|accountId>&sync=0

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/getAuthUser';
import ReportClient from '@/models/admin/ReportClient';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import AdCreative from '@/models/admin/AdCreative';
import { ensureAdsCoverage } from '@/lib/adsCoverage';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
const shiftDays = (date, days) => {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};

function scopeFilter({ platform, clientId }) {
    const filter = {};
    if (['google', 'meta'].includes(platform)) filter.platform = platform;
    if (clientId?.startsWith('account|')) {
        const [, accountPlatform, accountId] = clientId.split('|');
        filter.platform = accountPlatform;
        filter.accountId = accountId;
    } else if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
        filter.clientId = new mongoose.Types.ObjectId(clientId);
    }
    return filter;
}

const sums = {
    impressions: { $sum: '$impressions' },
    clicks: { $sum: '$clicks' },
    spend: { $sum: '$spend' },
    conversions: { $sum: '$conversions' },
    reach: { $sum: '$reach' },
};
const activeDate = { $cond: [{ $or: [{ $gt: ['$spend', 0] }, { $gt: ['$impressions', 0] }] }, '$date', null] };

// Per-entity totals over the range, with the latest known name/status/settings.
function entityPipeline(match, levels, limit) {
    return [
        { $match: { ...match, level: { $in: levels } } },
        { $sort: { date: 1 } },
        {
            $group: {
                _id: { platform: '$platform', accountId: '$accountId', level: '$level', entityId: '$entityId' },
                ...sums,
                clientId: { $last: '$clientId' },
                clientName: { $last: '$clientName' },
                campaign: { $last: '$campaign' },
                adGroup: { $last: '$adGroup' },
                entity: { $last: '$entity' },
                keyword: { $last: '$keyword' },
                productId: { $last: '$productId' },
                productBrand: { $last: '$productBrand' },
                productType: { $last: '$productType' },
                status: { $last: '$status' },
                currency: { $last: '$currency' },
                resultTypePairs: { $push: { t: '$resultType', c: '$conversions' } },
                budget: { $last: '$budget' },
                budgetType: { $last: '$budgetType' },
                bidStrategy: { $last: '$bidStrategy' },
                startTime: { $last: '$startTime' },
                endTime: { $last: '$endTime' },
                attributionSetting: { $last: '$attributionSetting' },
                objective: { $last: '$objective' },
                channelType: { $last: '$channelType' },
                optimizationGoal: { $last: '$optimizationGoal' },
                firstActive: { $min: activeDate },
                lastActive: { $max: activeDate },
                activeDays: { $sum: { $cond: [{ $gt: ['$spend', 0] }, 1, 0] } },
            },
        },
        { $sort: { spend: -1, impressions: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                platform: '$_id.platform',
                accountId: '$_id.accountId',
                level: '$_id.level',
                entityId: '$_id.entityId',
                impressions: 1, clicks: 1, spend: 1, conversions: 1, reach: 1,
                clientId: 1, clientName: 1, campaign: 1, adGroup: 1, entity: 1, keyword: 1, productId: 1, productBrand: 1, productType: 1,
                status: 1, currency: 1,
                // The result type with the most results across the range (deterministic, unlike a set).
                resultType: {
                    $let: {
                        vars: {
                            best: {
                                $reduce: {
                                    input: { $setUnion: ['$resultTypePairs.t'] },
                                    initialValue: { t: '', c: -1 },
                                    in: {
                                        $let: {
                                            vars: { total: { $sum: { $map: { input: { $filter: { input: '$resultTypePairs', as: 'p', cond: { $eq: ['$$p.t', '$$this'] } } }, as: 'p', in: '$$p.c' } } } },
                                            in: { $cond: [{ $and: [{ $gt: [{ $strLenCP: { $ifNull: ['$$this', ''] } }, 0] }, { $gt: ['$$total', '$$value.c'] }] }, { t: '$$this', c: '$$total' }, '$$value'] },
                                        },
                                    },
                                },
                            },
                        },
                        in: '$$best.t',
                    },
                },
                budget: 1, budgetType: 1, bidStrategy: 1, startTime: 1, endTime: 1, attributionSetting: 1, objective: 1, channelType: 1, optimizationGoal: 1,
                firstActive: 1, lastActive: 1, activeDays: 1,
            },
        },
    ];
}

const totalsPipeline = (match) => [
    { $match: { ...match, level: 'campaign' } },
    { $group: { _id: '$platform', ...sums, currency: { $last: '$currency' } } },
];

export async function GET(req) {
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const params = new URL(req.url).searchParams;
    const to = isDate(params.get('to')) ? params.get('to') : shiftDays(new Date().toISOString().slice(0, 10), -1);
    const from = isDate(params.get('from')) ? params.get('from') : shiftDays(to, -6);
    if (from > to) return Response.json({ error: 'The start date must be before the end date.' }, { status: 400 });
    const platform = params.get('platform') || '';
    const clientId = params.get('clientId') || '';

    // Same behaviour as the existing dashboard: fetch days that were never synced.
    if (params.get('sync') !== '0') {
        try {
            await ensureAdsCoverage({ from, to, platform, clientId });
        } catch (error) {
            console.error('[ads overview] coverage backfill failed:', error.message);
        }
    }

    const days = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    const prevTo = shiftDays(from, -1);
    const prevFrom = shiftDays(prevTo, -(days - 1));
    const scope = scopeFilter({ platform, clientId });
    const inRange = { ...scope, date: { $gte: from, $lte: to } };
    const allClientsInRange = { ...(['google', 'meta'].includes(platform) ? { platform } : {}), date: { $gte: from, $lte: to }, level: 'campaign' };

    const creativeScope = {};
    if (scope.platform) creativeScope.platform = scope.platform;
    if (scope.accountId) creativeScope.accountId = scope.accountId;
    if (scope.clientId) creativeScope.clientId = scope.clientId;

    const [clientList, unassignedAccounts, clientSummaries, daily, totals, prevTotals, campaigns, groups, ads, keywords, products, creatives, freshness] = await Promise.all([
        ReportClient.find({ status: 'active' }).select('_id name websites metaPageIds googleAdsCustomerIds metaAdAccountIds').sort({ name: 1 }).lean(),
        AdPerformanceDaily.aggregate([
            { $match: { clientId: null } },
            { $group: { _id: { platform: '$platform', accountId: '$accountId' }, name: { $first: '$clientName' } } },
            { $sort: { name: 1 } },
        ]),
        AdPerformanceDaily.aggregate([
            { $match: allClientsInRange },
            {
                $group: {
                    _id: { $cond: [{ $ifNull: ['$clientId', false] }, { $toString: '$clientId' }, { $concat: ['account|', '$platform', '|', '$accountId'] }] },
                    spend: { $sum: '$spend' },
                    conversions: { $sum: '$conversions' },
                    clicks: { $sum: '$clicks' },
                    platforms: { $addToSet: '$platform' },
                    currency: { $last: '$currency' },
                },
            },
        ]),
        AdPerformanceDaily.aggregate([
            { $match: { ...inRange, level: 'campaign' } },
            { $group: { _id: { date: '$date', platform: '$platform' }, ...sums } },
            { $sort: { '_id.date': 1 } },
        ]),
        AdPerformanceDaily.aggregate(totalsPipeline(inRange)),
        AdPerformanceDaily.aggregate(totalsPipeline({ ...scope, date: { $gte: prevFrom, $lte: prevTo } })),
        AdPerformanceDaily.aggregate(entityPipeline(inRange, ['campaign'], 2000)),
        AdPerformanceDaily.aggregate(entityPipeline(inRange, ['ad_group', 'ad_set'], 2000)),
        AdPerformanceDaily.aggregate(entityPipeline(inRange, ['ad'], 2000)),
        AdPerformanceDaily.aggregate(entityPipeline(inRange, ['keyword'], 3000)),
        AdPerformanceDaily.aggregate(entityPipeline(inRange, ['shopping_product'], 1500)),
        AdCreative.find(creativeScope).sort({ lastSeenAt: -1 }).limit(600).lean(),
        AdPerformanceDaily.aggregate([{ $match: inRange }, { $group: { _id: null, refreshedAt: { $max: '$updatedAt' }, rows: { $sum: 1 } } }]),
    ]);

    const clients = [
        ...clientList.map((c) => ({ ...c, _id: String(c._id), kind: 'client' })),
        ...unassignedAccounts.map((a) => ({
            _id: `account|${a._id.platform}|${a._id.accountId}`,
            name: a.name || a._id.accountId,
            kind: 'account',
            platform: a._id.platform,
            accountId: a._id.accountId,
            ...(a._id.platform === 'google' ? { googleAdsCustomerIds: [a._id.accountId] } : { metaAdAccountIds: [a._id.accountId] }),
        })),
    ];

    const byPlatform = (list) => {
        const out = { all: { impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0 } };
        for (const item of list) {
            out[item._id] = { impressions: item.impressions, clicks: item.clicks, spend: item.spend, conversions: item.conversions, reach: item.reach, currency: item.currency };
            for (const key of ['impressions', 'clicks', 'spend', 'conversions', 'reach']) out.all[key] += item[key] || 0;
            out.all.currency = out.all.currency || item.currency;
        }
        return out;
    };

    return Response.json({
        from, to, prevFrom, prevTo, days,
        clients,
        clientSummaries: Object.fromEntries(clientSummaries.map((s) => [s._id, { spend: s.spend, conversions: s.conversions, clicks: s.clicks, platforms: s.platforms, currency: s.currency }])),
        daily: daily.map((d) => ({ date: d._id.date, platform: d._id.platform, impressions: d.impressions, clicks: d.clicks, spend: d.spend, conversions: d.conversions, reach: d.reach })),
        totals: byPlatform(totals),
        prevTotals: byPlatform(prevTotals),
        campaigns, groups, ads, keywords, products,
        creatives,
        refreshedAt: freshness[0]?.refreshedAt || null,
        rowCount: freshness[0]?.rows || 0,
    });
}
