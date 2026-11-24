// lib/adsReportData.js
// Pure builder for the ads PDF report. No DB / PDF imports, so it is testable.
// Rule: a platform, campaign, day or detail row only appears when it has real
// activity. Nothing null/undefined/NaN is ever put into the report model.

const num = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
};
const text = (v) => (typeof v === 'string' ? v.trim() : '');

export function cleanClientName(name) {
    const cleaned = text(name).replace(/\s*·\s*(Google Ads|Meta Ads) account$/i, '').trim();
    return cleaned || 'All clients';
}

export function periodLabelFor(period, from, to) {
    if (period === 'weekly') return 'Weekly Performance Report';
    if (period === 'monthly') return 'Monthly Performance Report';
    const span = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    if (span >= 6 && span <= 8) return 'Weekly Performance Report';
    if (span >= 27 && span <= 32) return 'Monthly Performance Report';
    return 'Performance Report';
}

const hasActivity = (row) => ['impressions', 'clicks', 'spend', 'conversions'].some((k) => num(row[k]) > 0);

function aggregate(items, keys) {
    const map = new Map();
    for (const row of items) {
        const key = keys.map((k) => text(row[k]) || row[k] || '').join('|');
        const current = map.get(key) || { ...row, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, resultType: '' };
        for (const m of ['impressions', 'clicks', 'spend', 'conversions', 'reach']) current[m] += num(row[m]);
        if (!current.resultType && text(row.resultType)) current.resultType = text(row.resultType);
        map.set(key, current);
    }
    return [...map.values()].filter(hasActivity).sort((a, b) => b.spend - a.spend);
}

function campaignTotals(items) {
    const daily = new Map();
    const keyOf = (row) => [row.date, row.accountId, text(row.campaign)].join('|');
    items.filter((r) => r.level === 'campaign').forEach((r) => daily.set(keyOf(r), r));
    const priorities = ['ad_group', 'ad_set', 'ad', 'keyword', 'shopping_product'];
    const childGroups = new Map();
    items.filter((r) => priorities.includes(r.level) && hasActivity(r)).forEach((row) => {
        const key = keyOf(row);
        const priority = priorities.indexOf(row.level);
        const group = childGroups.get(key) || { priority, rows: [] };
        if (priority < group.priority) { group.priority = priority; group.rows = [row]; }
        else if (priority === group.priority) group.rows.push(row);
        childGroups.set(key, group);
    });
    for (const [key, group] of childGroups) {
        if (hasActivity(daily.get(key) || {})) continue;
        const [date, accountId, campaign] = key.split('|');
        const sum = (m) => group.rows.reduce((t, r) => t + num(r[m]), 0);
        const parent = daily.get(key);
        daily.set(key, { ...group.rows[0], ...parent, date, accountId, entityId: parent?.entityId || campaign, campaign, impressions: sum('impressions'), clicks: sum('clicks'), spend: sum('spend'), conversions: sum('conversions'), reach: sum('reach') });
    }
    return aggregate([...daily.values()].filter(hasActivity), ['platform', 'accountId', 'entityId', 'campaign']);
}

function dailyTotals(campaignDailyRows) {
    const map = new Map();
    for (const row of campaignDailyRows) {
        if (!hasActivity(row) || !text(row.date)) continue;
        const d = map.get(row.date) || { date: row.date, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0 };
        for (const m of ['impressions', 'clicks', 'spend', 'conversions', 'reach']) d[m] += num(row[m]);
        map.set(row.date, d);
    }
    return [...map.values()]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, costPerResult: d.conversions ? d.spend / d.conversions : 0, cpc: d.clicks ? d.spend / d.clicks : 0 }));
}

export function buildAdsReport({ rows = [], from = '', to = '', clientName = '', platform = 'all', period = '' } = {}) {
    const safeRows = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === 'object');
    const platformNames = platform === 'all' ? ['google', 'meta'] : [platform];
    const sections = platformNames.map((name) => {
        const scoped = safeRows.filter((r) => r.platform === name);
        const campaigns = campaignTotals(scoped)
            .filter((c) => text(c.campaign))
            .map((c) => ({ ...c, campaign: text(c.campaign), status: text(c.status), costPerResult: num(c.conversions) ? num(c.spend) / num(c.conversions) : 0, cpc: num(c.clicks) ? num(c.spend) / num(c.clicks) : 0, cpm: num(c.impressions) ? (num(c.spend) / num(c.impressions)) * 1000 : 0 }));
        const campaignDaily = scoped.filter((r) => r.level === 'campaign' && hasActivity(r));
        const daily = dailyTotals(campaignDaily.length ? campaignDaily : campaigns.map((c) => ({ ...c, date: text(c.date) })));
        const details = aggregate(
            scoped.filter((r) => ['keyword', 'shopping_product'].includes(r.level) && hasActivity(r) && (text(r.keyword) || text(r.entity))),
            ['level', 'accountId', 'entityId', 'campaign', 'keyword', 'entity']
        );
        const sum = (k) => campaigns.reduce((t, r) => t + num(r[k]), 0);
        const totals = {
            spend: sum('spend'), clicks: sum('clicks'), impressions: sum('impressions'),
            conversions: sum('conversions'), reach: sum('reach'),
        };
        totals.costPerResult = totals.conversions ? totals.spend / totals.conversions : 0;
        totals.cpc = totals.clicks ? totals.spend / totals.clicks : 0;
        totals.cpm = totals.impressions ? (totals.spend / totals.impressions) * 1000 : 0;
        totals.ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
        return {
            name,
            title: name === 'google' ? 'Google Ads' : 'Meta Ads',
            campaigns, details, daily, totals,
            resultType: text(campaigns.find((r) => text(r.resultType))?.resultType),
            currency: text(campaigns.find((r) => text(r.currency))?.currency) || text(details.find((r) => text(r.currency))?.currency) || 'INR',
            hasReach: name === 'meta' && totals.reach > 0,
            hasResults: totals.conversions > 0,
        };
    }).filter((s) => s.campaigns.length || s.details.length);
    return {
        clientName: cleanClientName(clientName),
        from: text(from), to: text(to),
        period: text(period),
        periodLabel: periodLabelFor(period, from, to),
        generatedOn: new Date().toISOString().slice(0, 10),
        sections,
        isEmpty: sections.length === 0,
    };
}
