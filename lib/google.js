// lib/google.js

import { google } from 'googleapis';
import { connectDB } from '@/lib/db';
import ReportSetting from '@/models/admin/ReportSetting';
import { googleStatus, googleMatchType, googleChannel, googleBidding, googleAdType } from '@/lib/adsLabels';

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
        // Google exposes product-level rows from this resource for both Shopping
        // and Performance Max. Keep it as its own level to avoid double-counting
        // campaign totals in dashboard summaries.
        { level: 'shopping_product', query: `SELECT segments.date, campaign.id, campaign.name, segments.product_item_id, segments.product_title, segments.product_brand, segments.product_type_l1, customer.currency_code, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM shopping_performance_view WHERE segments.date BETWEEN '${start}' AND '${end}'` },
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
            const product = row.segments || {};
            const entity = level === 'campaign' ? campaign : level === 'ad_group' ? adGroup : level === 'ad' ? (row.ad_group_ad?.ad?.name || '') : level === 'keyword' ? (row.ad_group_criterion?.keyword?.text || '') : (product.product_title || product.product_item_id || 'Shopping product');
            const entityId = String(level === 'campaign' ? row.campaign?.id : level === 'ad_group' ? row.ad_group?.id : level === 'ad' ? row.ad_group_ad?.ad?.id : level === 'keyword' ? row.ad_group_criterion?.criterion_id : `${product.product_item_id || ''}:${product.product_title || ''}`);
            const metrics = row.metrics || {};
            const clicks = Number(metrics.clicks || 0), spend = Number(metrics.cost_micros || 0) / 1e6;
            output.push({ date: row.segments.date, level, entityId, campaign, adGroup, entity, keyword: level === 'keyword' ? `${entity} (${googleMatchType(row.ad_group_criterion?.keyword?.match_type) || ''})` : '', productId: level === 'shopping_product' ? String(product.product_item_id || '') : '', productBrand: level === 'shopping_product' ? String(product.product_brand || '') : '', productType: level === 'shopping_product' ? String(product.product_type_l1 || '') : '', status: googleStatus(level === 'campaign' ? row.campaign?.status : level === 'ad_group' ? row.ad_group?.status : level === 'ad' ? row.ad_group_ad?.status : level === 'keyword' ? row.ad_group_criterion?.status : ''), currency: row.customer?.currency_code || '', impressions: Number(metrics.impressions || 0), clicks, spend, conversions: Number(metrics.conversions || 0), ctr: Number(metrics.ctr || 0), cpc: clicks ? spend / clicks : Number(metrics.average_cpc || 0) / 1e6 });
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
        output.push({ date: end, level: 'campaign', entityId: campaignId, campaign: row.campaign?.name || '', adGroup: '', entity: row.campaign?.name || '', keyword: '', status: googleStatus(row.campaign?.status), currency: row.customer?.currency_code || '', impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 });
    }
    const knownAds = new Set(output.filter((row) => row.level === 'ad').map((row) => row.entityId));
    for (const row of adRows || []) {
        const adId = String(row.ad_group_ad?.ad?.id || '');
        if (!adId || knownAds.has(adId)) continue;
        output.push({ date: end, level: 'ad', entityId: adId, campaign: row.campaign?.name || '', adGroup: row.ad_group?.name || '', entity: row.ad_group_ad?.ad?.name || '', keyword: '', status: googleStatus(row.ad_group_ad?.status), currency: row.customer?.currency_code || '', impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 });
    }
    // ── Best-effort extras: campaign type, bidding, budget, dates and ad copy.
    const metricWarnings = [...warnings];
    const settings = await fetchGoogleCampaignSettings(queryWithTimeout, warnings);
    for (const row of output) if (row.level === 'campaign' && settings.has(row.entityId)) Object.assign(row, settings.get(row.entityId));
    output.creatives = await fetchGoogleAdCopy(queryWithTimeout, warnings);
    output.warnings = warnings;
    output.coverageComplete = queryResults.every((result) => !warnings.some((warning) => warning.startsWith(`${result.level}:`)));
    if (!output.length && metricWarnings.length) throw new Error(metricWarnings.join(' | '));
    return output;
}

async function fetchGoogleCampaignSettings(query, warnings) {
    const settings = new Map();
    try {
        const rows = await query(`SELECT campaign.id, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign_budget.amount_micros, campaign_budget.period FROM campaign WHERE campaign.status != 'REMOVED'`);
        for (const row of rows || []) {
            const period = String(row.campaign_budget?.period ?? '');
            settings.set(String(row.campaign?.id), {
                channelType: googleChannel(row.campaign?.advertising_channel_type),
                bidStrategy: googleBidding(row.campaign?.bidding_strategy_type),
                budget: Number(row.campaign_budget?.amount_micros || 0) / 1e6,
                budgetType: period === '5' || period === 'CUSTOM_PERIOD' ? 'lifetime' : row.campaign_budget?.amount_micros ? 'daily' : '',
            });
        }
    } catch (error) {
        warnings.push(`campaign settings: ${error.message}`);
        return settings;
    }
    // Field names for dates changed across API versions; try both quietly.
    for (const [startField, endField] of [['start_date', 'end_date'], ['start_date_time', 'end_date_time']]) {
        try {
            const rows = await query(`SELECT campaign.id, campaign.${startField}, campaign.${endField} FROM campaign WHERE campaign.status != 'REMOVED'`);
            for (const row of rows || []) {
                const item = settings.get(String(row.campaign?.id));
                if (!item) continue;
                const end = String(row.campaign?.[endField] || '');
                item.startTime = String(row.campaign?.[startField] || '');
                item.endTime = end && !end.startsWith('2037') ? end : ''; // 2037-12-30 means "no end date"
            }
            break;
        } catch {
            /* try the other field name */
        }
    }
    return settings;
}

async function fetchGoogleAdCopy(query, warnings) {
    const base = 'campaign.id, campaign.name, ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.ad.type, ad_group_ad.ad.final_urls, ad_group_ad.status, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.ad.responsive_search_ad.path1, ad_group_ad.ad.responsive_search_ad.path2';
    // call_ad.* text fields are not queryable in the current API version (checked live), so call ads carry no copy.
    const extra = ', ad_group_ad.ad.responsive_display_ad.headlines, ad_group_ad.ad.responsive_display_ad.long_headline, ad_group_ad.ad.responsive_display_ad.descriptions';
    let rows = [];
    try {
        rows = await query(`SELECT ${base}${extra} FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'`);
    } catch {
        try {
            rows = await query(`SELECT ${base} FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'`);
        } catch (error) {
            warnings.push(`ad copy: ${error.message}`);
            return [];
        }
    }
    const texts = (list) => (Array.isArray(list) ? list.map((item) => item?.text).filter(Boolean) : []);
    return (rows || []).map((row) => {
        const ad = row.ad_group_ad?.ad || {};
        const rsa = ad.responsive_search_ad || {};
        const call = ad.call_ad || {};
        const display = ad.responsive_display_ad || {};
        const headlines = [...texts(rsa.headlines), call.headline1, call.headline2, ...texts(display.headlines), display.long_headline?.text].filter(Boolean);
        const descriptions = [...texts(rsa.descriptions), call.description1, call.description2, ...texts(display.descriptions)].filter(Boolean);
        const type = googleAdType(ad.type);
        return {
            adId: String(ad.id || ''),
            campaignId: String(row.campaign?.id || ''),
            campaign: row.campaign?.name || '',
            adGroup: row.ad_group?.name || '',
            name: ad.name || '',
            adType: type,
            status: googleStatus(row.ad_group_ad?.status),
            headlines: [...new Set(headlines)],
            descriptions: [...new Set(descriptions)],
            title: headlines[0] || '',
            body: descriptions[0] || '',
            finalUrl: (ad.final_urls || [])[0] || '',
            displayPath: [rsa.path1, rsa.path2].filter(Boolean).join('/'),
            phone: call.phone_number || '',
            format: type === 'RESPONSIVE_DISPLAY_AD' || type === 'IMAGE_AD' ? 'image' : type.includes('VIDEO') ? 'video' : 'text',
        };
    }).filter((item) => item.adId);
}
