// lib/google.js

import { google } from 'googleapis';
import { connectDB } from '@/lib/db';
import ReportSetting from '@/models/admin/ReportSetting';

async function getOAuthClient() {
    await connectDB();
    const setting = await ReportSetting.findOne({
        key: 'google_refresh_token',
    }).lean();
    if (!setting?.value) throw new Error('Google not connected.');
    const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    client.setCredentials({ refresh_token: setting.value });
    return client;
}

export async function getGA4(propertyId, start, end) {
    const auth = await getOAuthClient();
    const analytics = google.analyticsdata({ version: 'v1beta', auth });
    const resTotals = await analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate: start, endDate: end }],
            metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        },
    });
    const resDaily = await analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate: start, endDate: end }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
    });
    return { totals: resTotals.data, daily: resDaily.data?.rows || [] };
}

export async function getGSC(siteUrl, start, end, prevStart, prevEnd) {
    const auth = await getOAuthClient();
    const sc = google.searchconsole({ version: 'v1', auth });

    const totals = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: start, endDate: end, dimensions: [] },
    });
    const prevTotals = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: prevStart, endDate: prevEnd, dimensions: [] },
    });
    const daily = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: start, endDate: end, dimensions: ['date'] },
    });

    return {
        totals: totals.data.rows?.[0] || null,
        prevTotals: prevTotals.data.rows?.[0] || null,
        daily: daily.data.rows || [],
    };
}

export async function getGoogleAds(customerId, start, end, prevStart, prevEnd) {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) return { skipped: true, reason: 'Token missing' };

    await connectDB();
    const refreshSetting = await ReportSetting.findOne({
        key: 'google_refresh_token',
    }).lean();
    const { GoogleAdsApi } = await import('google-ads-api');

    const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
        refresh_token: refreshSetting.value,
    });

    const rowsTotals = await customer.query(`
    SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr
    FROM customer WHERE segments.date BETWEEN '${start}' AND '${end}'
  `);
    const rowsPrevTotals = await customer.query(`
    SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr
    FROM customer WHERE segments.date BETWEEN '${prevStart}' AND '${prevEnd}'
  `);
    const rowsDaily = await customer.query(`
    SELECT segments.date, metrics.clicks FROM customer WHERE segments.date BETWEEN '${start}' AND '${end}'
  `);

    const m = rowsTotals?.[0]?.metrics || {};
    const p = rowsPrevTotals?.[0]?.metrics || {};

    return {
        totals: {
            impressions: Number(m.impressions || 0),
            clicks: Number(m.clicks || 0),
            cost: Number(m.cost_micros || 0) / 1_000_000,
            conversions: Number(m.conversions || 0),
            ctr: Number(m.ctr || 0),
        },
        prevTotals: {
            impressions: Number(p.impressions || 0),
            clicks: Number(p.clicks || 0),
            cost: Number(p.cost_micros || 0) / 1_000_000,
            conversions: Number(p.conversions || 0),
            ctr: Number(p.ctr || 0),
        },
        daily: rowsDaily.map((r) => ({
            date: r.segments.date,
            clicks: r.metrics.clicks,
        })),
    };
}

// Daily, entity-level snapshots used by the cross-client ads dashboard.
export async function fetchGoogleAdsDaily(customerId, start, end) {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) throw new Error('Google Ads developer token is not configured.');
    await connectDB();
    const setting = await ReportSetting.findOne({ key: 'google_refresh_token' }).lean();
    if (!setting?.value) throw new Error('Google is not connected.');
    const { GoogleAdsApi } = await import('google-ads-api');
    const api = new GoogleAdsApi({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN });
    const customer = api.Customer({ customer_id: customerId, login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID, refresh_token: setting.value });
    const queryWithTimeout = (query) => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Google Ads query timed out after 45 seconds')), 45_000);
        customer.query(query).then((result) => { clearTimeout(timeout); resolve(result); }, (error) => { clearTimeout(timeout); reject(error); });
    });
    const queries = [
        { level: 'campaign', query: `SELECT segments.date, campaign.id, campaign.name, campaign.status, customer.currency_code, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE segments.date BETWEEN '${start}' AND '${end}'` },
        { level: 'ad_group', query: `SELECT segments.date, campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group.status, customer.currency_code, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM ad_group WHERE segments.date BETWEEN '${start}' AND '${end}'` },
        { level: 'ad', query: `SELECT segments.date, campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status, customer.currency_code, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM ad_group_ad WHERE segments.date BETWEEN '${start}' AND '${end}'` },
        { level: 'keyword', query: `SELECT segments.date, campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, customer.currency_code, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM keyword_view WHERE segments.date BETWEEN '${start}' AND '${end}'` },
    ];
    const output = [];
    const warnings = [];
    const queryResults = await Promise.all(queries.map(async ({ level, query }) => {
        try {
            return { level, rows: await queryWithTimeout(query) };
        } catch (error) {
            warnings.push(`${level}: ${error.message}`);
            return { level, rows: [] };
        }
    }));
    for (const { level, rows } of queryResults) {
        for (const row of rows || []) {
            const campaign = row.campaign?.name || '';
            const adGroup = row.ad_group?.name || '';
            const entity = level === 'campaign' ? campaign : level === 'ad_group' ? adGroup : level === 'ad' ? (row.ad_group_ad?.ad?.name || '') : (row.ad_group_criterion?.keyword?.text || '');
            const entityId = String(level === 'campaign' ? row.campaign?.id : level === 'ad_group' ? row.ad_group?.id : level === 'ad' ? row.ad_group_ad?.ad?.id : row.ad_group_criterion?.criterion_id);
            const metrics = row.metrics || {};
            const clicks = Number(metrics.clicks || 0), spend = Number(metrics.cost_micros || 0) / 1e6;
            output.push({ date: row.segments.date, level, entityId, campaign, adGroup, entity, keyword: level === 'keyword' ? `${entity} (${row.ad_group_criterion?.keyword?.match_type || ''})` : '', status: String((level === 'campaign' ? row.campaign?.status : level === 'ad_group' ? row.ad_group?.status : level === 'ad' ? row.ad_group_ad?.status : row.ad_group_criterion?.status) || ''), currency: row.customer?.currency_code || '', impressions: Number(metrics.impressions || 0), clicks, spend, conversions: Number(metrics.conversions || 0), ctr: Number(metrics.ctr || 0), cpc: clicks ? spend / clicks : Number(metrics.average_cpc || 0) / 1e6 });
        }
    }
    const [campaignRowsResult, adRowsResult] = await Promise.all([
        queryWithTimeout(`SELECT campaign.id, campaign.name, campaign.status, customer.currency_code FROM campaign WHERE campaign.status != 'REMOVED'`).then((rows) => ({ rows })).catch((error) => { warnings.push(`campaign status: ${error.message}`); return { rows: [] }; }),
        queryWithTimeout(`SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status, customer.currency_code FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'`).then((rows) => ({ rows })).catch((error) => { warnings.push(`ad status: ${error.message}`); return { rows: [] }; }),
    ]);
    const campaignRows = campaignRowsResult.rows;
    const adRows = adRowsResult.rows;
    const knownCampaigns = new Set(output.filter((row) => row.level === 'campaign').map((row) => row.entityId));
    for (const row of campaignRows || []) {
        const campaignId = String(row.campaign?.id || '');
        if (!campaignId || knownCampaigns.has(campaignId)) continue;
        output.push({ date: end, level: 'campaign', entityId: campaignId, campaign: row.campaign?.name || '', adGroup: '', entity: row.campaign?.name || '', keyword: '', status: String(row.campaign?.status || ''), currency: row.customer?.currency_code || '', impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 });
    }
    const knownAds = new Set(output.filter((row) => row.level === 'ad').map((row) => row.entityId));
    for (const row of adRows || []) {
        const adId = String(row.ad_group_ad?.ad?.id || '');
        if (!adId || knownAds.has(adId)) continue;
        output.push({ date: end, level: 'ad', entityId: adId, campaign: row.campaign?.name || '', adGroup: row.ad_group?.name || '', entity: row.ad_group_ad?.ad?.name || '', keyword: '', status: String(row.ad_group_ad?.status || ''), currency: row.customer?.currency_code || '', impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 });
    }
    output.warnings = warnings;
    if (!output.length && warnings.length) throw new Error(warnings.join(' | '));
    return output;
}
