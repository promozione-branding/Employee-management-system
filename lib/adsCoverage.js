// lib/adsCoverage.js
//
// Before reading the ads dashboard, fill any days in the range that were never
// synced for the selected accounts (moved here unchanged from the dashboard route).

import ReportClient from '@/models/admin/ReportClient';
import AdPerformanceDaily from '@/models/admin/AdPerformanceDaily';
import AdSnapshotCoverage from '@/models/admin/AdSnapshotCoverage';
import { syncAdsSnapshot } from '@/lib/adsSnapshot';

export async function ensureAdsCoverage({ from, to, platform, clientId, query = '' }) {
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
}
