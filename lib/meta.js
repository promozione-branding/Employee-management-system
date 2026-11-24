// lib/meta.js

import { connectDB } from '@/lib/db';
import MetaSetting from '@/models/admin/MetaSetting';
import { metaResultFromActions, metaResultForGoal } from '@/lib/metaResults';
import { formatAttribution, metaMoney } from '@/lib/adsLabels';

// 👈 Locked to v26.0 for long-term stability
const META_VERSION = 'v26.0';

async function getToken() {
    await connectDB();
    const setting = await MetaSetting.findOne({
        key: 'meta_access_token',
    }).lean();
    if (!setting?.value) throw new Error("Meta not connected. Please click 'Connect Meta' on the Reports page.");
    return setting.value;
}

export async function getMetaAds(adAccountId, since, until, prevSince, prevUntil) {
    const token = await getToken();

    const fetchPeriod = async (s, u) => {
        const url =
            `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
            new URLSearchParams({
                access_token: token,
                time_range: JSON.stringify({ since: s, until: u }),
                fields: 'spend,impressions,clicks,reach',
                level: 'account',
                time_increment: '1',
            });
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);

        let spend = 0,
            impressions = 0,
            clicks = 0,
            reach = 0;
        const daily = [];
        (json.data || []).forEach((day) => {
            spend += Number(day.spend || 0);
            impressions += Number(day.impressions || 0);
            clicks += Number(day.clicks || 0);
            reach += Number(day.reach || 0);
            daily.push({ date: day.date_start, clicks: Number(day.clicks || 0) });
        });
        return { totals: { spend, impressions, clicks, reach }, daily };
    };

    const current = await fetchPeriod(since, until);
    const previous = await fetchPeriod(prevSince, prevUntil);

    const campRes = await fetch(
        `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
            new URLSearchParams({
                access_token: token,
                time_range: JSON.stringify({ since, until }),
                fields: 'campaign_name,spend,clicks',
                level: 'campaign',
            })
    );
    const campJson = await campRes.json();
    const campaigns = (campJson.data || [])
        .map((c) => ({
            name: c.campaign_name,
            spend: Number(c.spend || 0),
            clicks: Number(c.clicks || 0),
        }))
        .filter((c) => c.spend > 0);

    return {
        totals: current.totals,
        prevTotals: previous.totals,
        daily: current.daily,
        campaigns,
    };
}

export async function fetchMetaAdsDaily(adAccountId, since, until) {
    const token = await getToken();
    const requestOptions = { signal: AbortSignal.timeout(45_000) };
    const accountResponse = await fetch(`https://graph.facebook.com/${META_VERSION}/${adAccountId}?${new URLSearchParams({ access_token: token, fields: 'currency' })}`, requestOptions);
    const accountJson = await accountResponse.json();
    if (!accountResponse.ok || accountJson.error) throw new Error(accountJson.error?.message || 'Could not read Meta ad account currency.');
    const campaigns = new Map();
    let campaignsUrl = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/campaigns?${new URLSearchParams({ access_token: token, fields: 'id,name,status,effective_status', limit: '500' })}`;
    while (campaignsUrl) {
        const response = await fetch(campaignsUrl, requestOptions);
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(json.error?.message || 'Could not read Meta campaign statuses.');
        for (const campaign of json.data || []) campaigns.set(String(campaign.id), { name: campaign.name || '', status: campaign.effective_status || campaign.status || '' });
        campaignsUrl = json.paging?.next || '';
    }
    const ads = new Map();
    let adsUrl = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/ads?${new URLSearchParams({ access_token: token, fields: 'id,name,status,effective_status,campaign_id,adset_id', limit: '500' })}`;
    while (adsUrl) {
        const response = await fetch(adsUrl, requestOptions);
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(json.error?.message || 'Could not read Meta ad statuses.');
        for (const ad of json.data || []) ads.set(String(ad.id), ad);
        adsUrl = json.paging?.next || '';
    }
    // ── Best-effort extras: budgets, bid strategy, end dates, attribution, optimisation
    // goals and ad creatives. A failure here only adds a warning; metrics still sync.
    const warnings = [];
    const currency = accountJson.currency || '';
    const pagedGet = async (path, params) => {
        const out = [];
        let pageUrl = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/${path}?${new URLSearchParams({ access_token: token, ...params })}`;
        while (pageUrl) {
            const response = await fetch(pageUrl, requestOptions);
            const json = await response.json();
            if (!response.ok || json.error) throw new Error(json.error?.message || `Meta ${path} request failed.`);
            out.push(...(json.data || []));
            pageUrl = json.paging?.next || '';
        }
        return out;
    };
    const campaignMeta = new Map();
    const adSetMeta = new Map();
    try {
        for (const item of await pagedGet('campaigns', { fields: 'id,objective,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time', limit: '500' })) campaignMeta.set(String(item.id), item);
    } catch (error) {
        warnings.push(`campaign settings: ${error.message}`);
    }
    try {
        for (const item of await pagedGet('adsets', { fields: 'id,campaign_id,effective_status,daily_budget,lifetime_budget,bid_strategy,start_time,end_time,optimization_goal,promoted_object,attribution_spec', limit: '500' })) adSetMeta.set(String(item.id), item);
    } catch (error) {
        warnings.push(`ad set settings: ${error.message}`);
    }
    const unique = (values) => {
        const list = [...new Set(values.filter(Boolean))];
        return list.length === 1 ? list[0] : list.length > 1 ? 'MIXED' : '';
    };
    const adSetSettings = (adSetId) => {
        const set = adSetMeta.get(String(adSetId));
        if (!set) return {};
        const campaign = campaignMeta.get(String(set.campaign_id)) || {};
        const usesCampaignBudget = Number(campaign.daily_budget || campaign.lifetime_budget || 0) > 0;
        return {
            budget: usesCampaignBudget ? 0 : metaMoney(set.daily_budget || set.lifetime_budget, currency),
            budgetType: usesCampaignBudget ? 'campaign' : Number(set.daily_budget) ? 'daily' : Number(set.lifetime_budget) ? 'lifetime' : '',
            bidStrategy: set.bid_strategy || campaign.bid_strategy || '',
            startTime: set.start_time || '',
            endTime: set.end_time || '',
            attributionSetting: formatAttribution(set.attribution_spec),
            objective: campaign.objective || '',
            optimizationGoal: set.optimization_goal || '',
        };
    };
    const settingsCache = new Map();
    const campaignSettings = (campaignId) => {
        if (!settingsCache.has(String(campaignId))) settingsCache.set(String(campaignId), computeCampaignSettings(campaignId));
        return settingsCache.get(String(campaignId));
    };
    const computeCampaignSettings = (campaignId) => {
        const campaign = campaignMeta.get(String(campaignId));
        const sets = [...adSetMeta.values()].filter((set) => String(set.campaign_id) === String(campaignId));
        if (!campaign && !sets.length) return {};
        const liveSets = sets.filter((set) => !/DELETED|ARCHIVED/.test(set.effective_status || ''));
        let budget = 0, budgetType = '';
        if (Number(campaign?.daily_budget)) [budget, budgetType] = [metaMoney(campaign.daily_budget, currency), 'daily'];
        else if (Number(campaign?.lifetime_budget)) [budget, budgetType] = [metaMoney(campaign.lifetime_budget, currency), 'lifetime'];
        else {
            const activeSets = liveSets.filter((set) => set.effective_status === 'ACTIVE');
            const pool = activeSets.length ? activeSets : liveSets;
            budget = pool.reduce((sum, set) => sum + metaMoney(set.daily_budget || set.lifetime_budget, currency), 0);
            budgetType = budget ? 'adset' : '';
        }
        const ends = liveSets.map((set) => set.end_time);
        return {
            budget,
            budgetType,
            bidStrategy: campaign?.bid_strategy || unique(liveSets.map((set) => set.bid_strategy)),
            startTime: campaign?.start_time || '',
            endTime: campaign?.stop_time || (ends.length && ends.every(Boolean) ? ends.sort().at(-1) : ''),
            attributionSetting: unique(liveSets.map((set) => formatAttribution(set.attribution_spec))).replace('MIXED', 'Mixed'),
            objective: campaign?.objective || '',
            optimizationGoal: unique(liveSets.map((set) => set.optimization_goal)),
        };
    };

    const url = new URL(`https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights`);
    url.search = new URLSearchParams({ access_token: token, time_range: JSON.stringify({ since, until }), fields: 'date_start,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,clicks,spend,reach,actions', level: 'ad', time_increment: '1', limit: '500' }).toString();
    const output = [];
    let next = url.toString();
    while (next) {
        const response = await fetch(next, requestOptions);
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(json.error?.message || 'Meta insights request failed.');
        for (const row of json.data || []) {
            const clicks = Number(row.clicks || 0), spend = Number(row.spend || 0);
            const campaignId = String(row.campaign_id || '');
            const adSet = adSetMeta.get(String(row.adset_id || ''));
            const result = (adSet && metaResultForGoal(row.actions, adSet.optimization_goal, adSet.promoted_object, { reach: Number(row.reach || 0), impressions: Number(row.impressions || 0) })) || metaResultFromActions(row.actions);
            const base = { date: row.date_start, campaignId, adSetId: String(row.adset_id || ''), campaign: row.campaign_name || campaigns.get(campaignId)?.name || '', status: campaigns.get(campaignId)?.status || '', adGroup: row.adset_name || '', currency: accountJson.currency || '', impressions: Number(row.impressions || 0), clicks, spend, reach: Number(row.reach || 0), cpc: clicks ? spend / clicks : 0, ctr: Number(row.impressions) ? clicks / Number(row.impressions) : 0, conversions: result.conversions, resultType: result.resultType, optimizationGoal: adSet?.optimization_goal || '' };
            const adId = String(row.ad_id || '');
            const ad = ads.get(adId);
            output.push({ ...base, status: ad?.effective_status || ad?.status || base.status, level: 'ad', entityId: adId, entity: row.ad_name || ad?.name || '' });
        }
        next = json.paging?.next || '';
    }
    const groups = new Map();
    for (const row of output) {
        for (const [level, id, name] of [['campaign', row.campaignId, row.campaign], ['ad_set', row.adSetId, row.adGroup]]) {
            const entityId = String(id || '');
            const key = `${row.date}:${level}:${entityId}`;
            const current = groups.get(key) || { ...row, level, entityId, entity: name, ...(level === 'campaign' ? campaignSettings(entityId) : adSetSettings(entityId)), impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, resultType: '' };
            current.impressions += row.impressions; current.clicks += row.clicks; current.spend += row.spend; current.conversions += row.conversions; current.reach += row.reach;
            if (!current.resultType && row.resultType) current.resultType = row.resultType;
            current.cpc = current.clicks ? current.spend / current.clicks : 0;
            current.ctr = current.impressions ? current.clicks / current.impressions : 0;
            groups.set(key, current);
        }
    }
    const campaignRows = new Set([...groups.values()].filter((row) => row.level === 'campaign').map((row) => row.entityId));
    for (const [campaignId, campaign] of campaigns) {
        if (campaignRows.has(campaignId)) continue;
        groups.set(`${until}:campaign:${campaignId}`, { date: until, level: 'campaign', entityId: campaignId, campaign: campaign.name, adGroup: '', entity: campaign.name, status: campaign.status, ...campaignSettings(campaignId), currency: accountJson.currency || '', impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0, resultType: '', ctr: 0, cpc: 0 });
    }
    const knownAds = new Set(output.filter((row) => row.level === 'ad').map((row) => row.entityId));
    for (const [adId, ad] of ads) {
        if (knownAds.has(adId)) continue;
        const campaign = campaigns.get(String(ad.campaign_id)) || {};
        groups.set(`${until}:ad:${adId}`, { date: until, level: 'ad', entityId: adId, campaign: campaign.name || '', adGroup: '', entity: ad.name || '', status: ad.effective_status || ad.status || '', currency: accountJson.currency || '', impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0, resultType: '', ctr: 0, cpc: 0 });
    }
    const result = [...output, ...groups.values()];
    result.coverageComplete = true;
    result.creatives = await fetchMetaCreatives(pagedGet, campaigns, warnings);
    if (warnings.length) result.warnings = warnings;
    return result;
}

export async function getMetaPage(pageId, since, until, prevSince, prevUntil) {
    const userToken = await getToken();

    // 1. Get the Page Access Token
    const tokenUrl = `https://graph.facebook.com/${META_VERSION}/${pageId}?fields=access_token&access_token=${userToken}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenJson = await tokenRes.json();

    if (!tokenJson.access_token) {
        return {
            views: 0,
            interactions: 0,
            followers: 0,
            daily: [],
            prevTotals: { views: 0, interactions: 0, followers: 0 },
        };
    }

    const pageToken = tokenJson.access_token;

    const fetchPeriod = async (s, u) => {
        const url =
            `https://graph.facebook.com/${META_VERSION}/${pageId}/insights?` +
            new URLSearchParams({
                access_token: pageToken,
                since: s,
                until: u,
                metric: 'page_media_view,page_post_engagements,page_follows',
                period: 'day',
            });

        const res = await fetch(url);
        const json = await res.json();

        let views = 0,
            interactions = 0,
            followers = 0;
        const daily = [];

        (json.data || []).forEach((metric) => {
            if (metric.name === 'page_media_view') {
                metric.values.forEach((v) => {
                    views += Number(v.value || 0);
                    daily.push({ date: v.end_time, views: Number(v.value || 0) });
                });
            }
            if (metric.name === 'page_post_engagements') {
                metric.values.forEach((v) => {
                    interactions += Number(v.value || 0);
                });
            }
            if (metric.name === 'page_follows') {
                metric.values.forEach((v) => {
                    followers += Number(v.value || 0);
                });
            }
        });

        return { views, interactions, followers, daily };
    };

    const current = await fetchPeriod(since, until);
    const previous = await fetchPeriod(prevSince, prevUntil);

    return { ...current, prevTotals: previous };
}

// Ad copy + image/video for every ad, for the dashboard's "Ads & creatives" tab.
async function fetchMetaCreatives(pagedGet, campaigns, warnings) {
    const creativeFields = 'id,title,body,image_url,thumbnail_url,call_to_action_type,object_type,video_id,link_url,object_story_spec,asset_feed_spec';
    let ads = [];
    try {
        // Ask for a larger thumbnail; fall back to the default field set if this account rejects it.
        ads = await pagedGet('ads', { fields: `id,name,effective_status,campaign_id,adset_id,created_time,creative.thumbnail_width(600).thumbnail_height(600){${creativeFields}}`, limit: '100' });
    } catch {
        try {
            ads = await pagedGet('ads', { fields: `id,name,effective_status,campaign_id,adset_id,created_time,creative{${creativeFields}}`, limit: '50' });
        } catch (error) {
            warnings.push(`ad creatives: ${error.message}`);
            return [];
        }
    }
    return ads.map((ad) => {
        const c = ad.creative || {};
        const spec = c.object_story_spec || {};
        const link = spec.link_data || {};
        const video = spec.video_data || {};
        const feed = c.asset_feed_spec || {};
        const texts = (list) => (Array.isArray(list) ? list.map((item) => item?.text).filter(Boolean) : []);
        const children = Array.isArray(link.child_attachments) ? link.child_attachments : [];
        const titles = [...new Set([c.title, link.name, video.title, ...texts(feed.titles), ...children.map((child) => child.name)].filter(Boolean))];
        const bodies = [...new Set([c.body, link.message, video.message, ...texts(feed.bodies)].filter(Boolean))];
        return {
            adId: String(ad.id),
            campaignId: String(ad.campaign_id || ''),
            campaign: campaigns.get(String(ad.campaign_id))?.name || '',
            name: ad.name || '',
            adType: c.object_type || '',
            status: ad.effective_status || '',
            title: titles[0] || '',
            headlines: titles,
            body: bodies[0] || '',
            descriptions: [...new Set([link.description, ...texts(feed.descriptions), ...bodies.slice(1)].filter(Boolean))],
            callToAction: c.call_to_action_type || link.call_to_action?.type || video.call_to_action?.type || (Array.isArray(feed.call_to_action_types) ? feed.call_to_action_types[0] : '') || '',
            finalUrl: c.link_url || link.link || video.call_to_action?.value?.link || feed.link_urls?.[0]?.website_url || '',
            imageUrl: c.image_url || link.picture || video.image_url || children[0]?.picture || '',
            thumbnailUrl: c.thumbnail_url || '',
            format: c.video_id || video.video_id || c.object_type === 'VIDEO' ? 'video' : children.length > 1 ? 'carousel' : c.image_url || link.picture ? 'image' : 'text',
            createdTime: ad.created_time || '',
        };
    });
}
