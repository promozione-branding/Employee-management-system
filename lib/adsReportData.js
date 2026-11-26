// lib/adsReportData.js
// Pure builder for the ads PDF report. No DB / PDF imports, so it is testable.
// Rule: a platform, campaign, day or detail row only appears when it has real
// activity. Nothing null/undefined/NaN is ever put into the report model.

import { costPerResult, splitKeyword } from './adsLabels.js';

const num = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
};
const text = (v) => (typeof v === 'string' ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : '');
const METRICS = ['impressions', 'clicks', 'spend', 'conversions', 'reach'];
// Settings that describe an entity; the latest non-empty value in the range wins (like Ads Manager).
const SETTINGS = ['status', 'currency', 'clientName', 'adGroup', 'budgetType', 'bidStrategy', 'startTime', 'endTime', 'attributionSetting', 'objective', 'channelType', 'optimizationGoal', 'keyword', 'entity', 'productId', 'productBrand', 'productType'];

export function cleanClientName(name) {
    const cleaned = text(name).replace(/\s*·\s*(Google Ads|Meta Ads) account$/i, '').trim();
    return cleaned || 'All clients';
}

export function periodLabelFor(period, from, to) {
    if (period === 'weekly') return 'Weekly Performance Report';
    if (period === 'monthly') return 'Monthly Performance Report';
    const span = daySpan(from, to);
    if (span >= 6 && span <= 8) return 'Weekly Performance Report';
    if (span >= 27 && span <= 32) return 'Monthly Performance Report';
    return 'Performance Report';
}

function daySpan(from, to) {
    const n = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    return Number.isFinite(n) && n > 0 ? n : 0;
}

const hasActivity = (row) => ['impressions', 'clicks', 'spend', 'conversions'].some((k) => num(row[k]) > 0);

/** Sums metrics per key, keeps the latest settings and the dominant result type. Rows must be date-ascending. */
function aggregate(items, keys) {
    const map = new Map();
    for (const row of items) {
        const key = keys.map((k) => text(row[k]) || row[k] || '').join('|');
        let current = map.get(key);
        if (!current) {
            current = { ...row, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, resultType: '', budget: 0, activeDays: 0, typeTotals: {} };
            map.set(key, current);
        }
        for (const m of METRICS) current[m] += num(row[m]);
        if (num(row.spend) > 0) current.activeDays += 1;
        for (const s of SETTINGS) if (text(row[s])) current[s] = text(row[s]);
        if (num(row.budget) > 0 || text(row.budgetType)) current.budget = num(row.budget);
        const type = text(row.resultType);
        if (type) current.typeTotals[type] = (current.typeTotals[type] || 0) + num(row.conversions);
    }
    return [...map.values()]
        .map(({ typeTotals, ...row }) => {
            const best = Object.entries(typeTotals).sort((a, b) => b[1] - a[1])[0];
            // Google reports untyped "Conversions"; label them so they are never merged into a Meta type.
            return { ...row, resultType: best ? best[0] : row.platform === 'google' && row.conversions > 0 ? 'Conversions' : '' };
        })
        .filter(hasActivity)
        .sort((a, b) => b.spend - a.spend || b.impressions - a.impressions);
}

function withRates(row) {
    return {
        ...row,
        costPerResult: num(row.conversions) ? costPerResult(num(row.spend), num(row.conversions), row.resultType) : 0,
        cpc: num(row.clicks) ? num(row.spend) / num(row.clicks) : 0,
        cpm: num(row.impressions) ? (num(row.spend) / num(row.impressions)) * 1000 : 0,
        ctr: num(row.impressions) ? num(row.clicks) / num(row.impressions) : 0,
    };
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
    const rows = [...daily.values()].filter(hasActivity).sort((a, b) => text(a.date).localeCompare(text(b.date)));
    return { rows, campaigns: aggregate(rows, ['platform', 'accountId', 'entityId', 'campaign']) };
}

function dailyTotals(campaignDailyRows) {
    const map = new Map();
    for (const row of campaignDailyRows) {
        if (!hasActivity(row) || !text(row.date)) continue;
        const d = map.get(row.date) || { date: row.date, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, types: new Set() };
        for (const m of METRICS) d[m] += num(row[m]);
        if (text(row.resultType)) d.types.add(text(row.resultType));
        else if (row.platform === 'google' && num(row.conversions) > 0) d.types.add('Conversions');
        map.set(row.date, d);
    }
    return [...map.values()]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(({ types, ...d }) => withRates({ ...d, resultType: types.size === 1 ? [...types][0] : '' }));
}

const sumTotals = (list) => {
    const totals = { spend: 0, clicks: 0, impressions: 0, conversions: 0, reach: 0 };
    for (const r of list) for (const m of METRICS) totals[m] += num(r[m]);
    return totals;
};
const singleType = (list) => {
    const types = [...new Set(list.filter((r) => num(r.conversions) > 0).map((r) => text(r.resultType)).filter(Boolean))];
    return types.length === 1 ? types[0] : '';
};

function creativeIndex(creatives) {
    const map = new Map();
    for (const c of Array.isArray(creatives) ? creatives : []) {
        if (!c || !text(c.adId)) continue;
        const list = (v) => (Array.isArray(v) ? v : text(v) ? [v] : []).map(text).filter(Boolean);
        const headlines = list(c.headlines);
        const descriptions = list(c.descriptions);
        map.set(`${c.platform}|${text(c.accountId)}|${text(c.adId)}`, {
            headline: text(c.title) || headlines[0] || '',
            headlines,
            body: text(c.body) || descriptions[0] || '',
            callToAction: text(c.callToAction),
            finalUrl: text(c.finalUrl),
            format: text(c.format),
            adType: text(c.adType),
        });
    }
    return map;
}

export function buildAdsReport({ rows = [], prevRows = [], creatives = [], links = null, from = '', to = '', clientName = '', platform = 'all', period = '' } = {}) {
    const clean = (list) => (Array.isArray(list) ? list : []).filter((r) => r && typeof r === 'object').sort((a, b) => text(a.date).localeCompare(text(b.date)));
    const safeRows = clean(rows);
    const safePrev = clean(prevRows);
    const adCopy = creativeIndex(creatives);
    const platformNames = platform === 'all' ? ['google', 'meta'] : [platform];
    const sections = platformNames.map((name) => {
        const scoped = safeRows.filter((r) => r.platform === name);
        const { rows: campaignDays, campaigns: rawCampaigns } = campaignTotals(scoped);
        const campaigns = rawCampaigns
            .filter((c) => text(c.campaign))
            .map((c) => withRates({ ...c, campaign: text(c.campaign), status: text(c.status) }));
        const daily = dailyTotals(campaignDays.length ? campaignDays : campaigns.map((c) => ({ ...c, date: text(c.date) })));
        const details = aggregate(
            scoped.filter((r) => ['keyword', 'shopping_product'].includes(r.level) && hasActivity(r) && (text(r.keyword) || text(r.entity))),
            ['level', 'accountId', 'entityId', 'campaign', 'keyword', 'entity']
        );
        const groups = aggregate(scoped.filter((r) => ['ad_group', 'ad_set'].includes(r.level) && hasActivity(r)), ['accountId', 'entityId'])
            .map((g) => withRates({ ...g, name: text(g.entity) || text(g.adGroup) }))
            .filter((g) => g.name);
        const ads = aggregate(scoped.filter((r) => r.level === 'ad' && hasActivity(r)), ['accountId', 'entityId']).map((a) => {
            const copy = adCopy.get(`${name}|${text(a.accountId)}|${text(a.entityId)}`) || {};
            return withRates({ ...a, ...copy, name: text(a.entity) || copy.headline || `Ad ${text(a.entityId)}` });
        });
        const keywords = details.filter((d) => d.level === 'keyword').map((k) => {
            const { text: kw, match } = splitKeyword(k.keyword, k.entity);
            return withRates({ ...k, keywordText: text(kw), matchType: text(match) });
        }).filter((k) => k.keywordText);
        const products = details.filter((d) => d.level === 'shopping_product').map((p) => withRates({ ...p, name: text(p.entity) || text(p.productId) })).filter((p) => p.name);

        const totals = withRates({ ...sumTotals(campaigns), resultType: singleType(campaigns) });
        const prevCampaigns = campaignTotals(safePrev.filter((r) => r.platform === name)).campaigns;
        const prevTotals = withRates({ ...sumTotals(prevCampaigns), resultType: singleType(prevCampaigns) });
        return {
            name,
            title: name === 'google' ? 'Google Ads' : 'Meta Ads',
            campaigns, details, daily, totals, prevTotals,
            groups, ads, keywords, products,
            accounts: [...new Set(campaigns.map((c) => text(c.accountId)).filter(Boolean))],
            resultType: totals.resultType,
            currency: text(campaigns.find((r) => text(r.currency))?.currency) || text(details.find((r) => text(r.currency))?.currency) || 'INR',
            hasReach: name === 'meta' && totals.reach > 0,
            hasResults: totals.conversions > 0,
        };
    }).filter((s) => s.campaigns.length || s.details.length);

    // Whole-report view (both platforms together).
    const allCampaigns = sections.flatMap((s) => s.campaigns);
    const overall = withRates({ ...sumTotals(allCampaigns), resultType: singleType(allCampaigns) });
    const prevOverall = withRates({ ...sumTotals(sections.map((s) => s.prevTotals)), resultType: overall.resultType });
    const dayMap = new Map();
    for (const s of sections) {
        for (const d of s.daily) {
            const row = dayMap.get(d.date) || { date: d.date, google: 0, meta: 0, impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0 };
            row[s.name] += d.spend;
            for (const m of METRICS) row[m] += num(d[m]);
            dayMap.set(d.date, row);
        }
    }
    const daily = [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date)).map((d) => withRates({ ...d, resultType: overall.resultType }));
    const currency = sections[0]?.currency || 'INR';
    const days = daySpan(from, to);
    const prevTo = days ? new Date(Date.parse(`${from}T00:00:00Z`) - 86400000).toISOString().slice(0, 10) : '';
    const prevFrom = days ? new Date(Date.parse(`${prevTo}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10) : '';

    return {
        clientName: cleanClientName(clientName),
        from: text(from), to: text(to),
        days, prevFrom, prevTo,
        period: text(period),
        periodLabel: periodLabelFor(period, from, to),
        generatedOn: new Date().toISOString().slice(0, 10),
        currency,
        overall, prevOverall, daily,
        highlights: buildHighlights({ sections, overall, prevOverall, daily }),
        links: { meta: text(links?.meta), google: text(links?.google) },
        sections,
        isEmpty: sections.length === 0,
    };
}

/** Short, factual takeaways. Each one only appears when the data behind it exists. */
function buildHighlights({ sections, overall, prevOverall, daily }) {
    const out = [];
    const campaigns = sections.flatMap((s) => s.campaigns.map((c) => ({ ...c, platformTitle: s.title })));
    if (overall.spend && prevOverall.spend) {
        const change = ((overall.spend - prevOverall.spend) / prevOverall.spend) * 100;
        out.push({ kind: 'spend', change, value: overall.spend, prev: prevOverall.spend });
    }
    if (overall.conversions && prevOverall.conversions) {
        out.push({ kind: 'results', change: ((overall.conversions - prevOverall.conversions) / prevOverall.conversions) * 100, value: overall.conversions, prev: prevOverall.conversions, resultType: overall.resultType });
    }
    const withResults = campaigns.filter((c) => c.conversions > 0);
    const most = [...withResults].sort((a, b) => b.conversions - a.conversions)[0];
    if (most) out.push({ kind: 'mostResults', campaign: most.campaign, platformTitle: most.platformTitle, value: most.conversions, resultType: most.resultType, currency: most.currency });
    const cheapest = [...withResults].filter((c) => c.conversions >= 3).sort((a, b) => a.costPerResult - b.costPerResult)[0];
    if (cheapest && cheapest !== most) out.push({ kind: 'bestCost', campaign: cheapest.campaign, platformTitle: cheapest.platformTitle, value: cheapest.costPerResult, resultType: cheapest.resultType, currency: cheapest.currency });
    const topSpend = campaigns[0];
    if (topSpend && overall.spend) out.push({ kind: 'topSpend', campaign: topSpend.campaign, platformTitle: topSpend.platformTitle, value: topSpend.spend, share: (topSpend.spend / overall.spend) * 100, currency: topSpend.currency });
    const peak = [...daily].sort((a, b) => b.spend - a.spend)[0];
    if (peak && daily.length > 1) out.push({ kind: 'peakDay', date: peak.date, value: peak.spend, conversions: peak.conversions });
    const google = sections.find((s) => s.name === 'google');
    const topKeyword = [...(google?.keywords || [])].sort((a, b) => b.clicks - a.clicks)[0];
    if (topKeyword?.clicks) out.push({ kind: 'topKeyword', keyword: topKeyword.keywordText, value: topKeyword.clicks, ctr: topKeyword.ctr });
    return out;
}
