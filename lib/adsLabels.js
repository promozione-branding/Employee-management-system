// lib/adsLabels.js
//
// Pure, browser-safe helpers that turn raw Google Ads / Meta values into the
// labels people see in Google Ads and Meta Ads Manager. Older saved rows hold
// Google enum numbers ("2", "3"), so every read goes through these.

const GOOGLE_STATUS = { 0: 'UNSPECIFIED', 1: 'UNKNOWN', 2: 'ENABLED', 3: 'PAUSED', 4: 'REMOVED' };
const GOOGLE_MATCH = { 2: 'Exact', 3: 'Phrase', 4: 'Broad', EXACT: 'Exact', PHRASE: 'Phrase', BROAD: 'Broad' };
const GOOGLE_CHANNEL = {
    2: 'SEARCH', 3: 'DISPLAY', 4: 'SHOPPING', 5: 'HOTEL', 6: 'VIDEO', 7: 'MULTI_CHANNEL', 8: 'LOCAL', 9: 'SMART',
    10: 'PERFORMANCE_MAX', 11: 'LOCAL_SERVICES', 13: 'TRAVEL', 14: 'DEMAND_GEN',
};
const GOOGLE_BIDDING = {
    2: 'ENHANCED_CPC', 3: 'MANUAL_CPC', 4: 'MANUAL_CPM', 5: 'PAGE_ONE_PROMOTED', 6: 'TARGET_CPA', 7: 'TARGET_OUTRANK_SHARE', 8: 'TARGET_ROAS',
    9: 'TARGET_SPEND', 10: 'MAXIMIZE_CONVERSIONS', 11: 'MAXIMIZE_CONVERSION_VALUE', 12: 'PERCENT_CPC', 13: 'MANUAL_CPV', 14: 'TARGET_CPM',
    15: 'TARGET_IMPRESSION_SHARE', 16: 'COMMISSION', 18: 'MANUAL_CPA', 19: 'FIXED_CPM', 20: 'TARGET_CPV', 21: 'TARGET_CPC', 22: 'FIXED_SHARE_OF_VOICE',
};
const GOOGLE_AD_TYPE = { 2: 'TEXT_AD', 3: 'EXPANDED_TEXT_AD', 14: 'IMAGE_AD', 15: 'RESPONSIVE_SEARCH_AD', 19: 'RESPONSIVE_DISPLAY_AD', 32: 'CALL_AD', 30: 'VIDEO_RESPONSIVE_AD', 40: 'DEMAND_GEN_MULTI_ASSET_AD', 41: 'DEMAND_GEN_CAROUSEL_AD', 42: 'DEMAND_GEN_VIDEO_RESPONSIVE_AD', 39: 'DEMAND_GEN_PRODUCT_AD', 10: 'SHOPPING_PRODUCT_AD', 12: 'VIDEO_AD', 25: 'VIDEO_BUMPER_AD', 29: 'VIDEO_TRUEVIEW_IN_STREAM_AD', 31: 'SMART_CAMPAIGN_AD' };

const pretty = (value) => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
const fromEnum = (map, value) => (value === null || value === undefined || value === '' ? '' : map[value] || map[Number(value)] || String(value));

export const googleStatus = (value) => fromEnum(GOOGLE_STATUS, value);
export const googleChannel = (value) => fromEnum(GOOGLE_CHANNEL, value);
export const googleBidding = (value) => fromEnum(GOOGLE_BIDDING, value);
export const googleAdType = (value) => fromEnum(GOOGLE_AD_TYPE, value);
export const googleMatchType = (value) => GOOGLE_MATCH[value] || GOOGLE_MATCH[Number(value)] || pretty(value);

/** "keyword text (4)" (old saved rows) -> { text, match: 'Broad' } */
export function splitKeyword(keyword, entity = '') {
    const match = String(keyword || '').match(/^(.*) \(([^()]*)\)$/);
    if (!match) return { text: keyword || entity || '', match: '' };
    return { text: match[1], match: googleMatchType(match[2]) };
}

/** Normalises any platform status into a delivery label + on/off flag, like Ads Manager's "Delivery" column. */
export function deliveryOf(platform, status) {
    const raw = platform === 'google' ? googleStatus(status) : String(status || '');
    const s = raw.toUpperCase();
    if (!s) return { label: 'Reported', on: true, raw };
    if (['ENABLED', 'ACTIVE', 'SERVING'].includes(s)) return { label: 'Active', on: true, raw };
    if (s === 'REMOVED' || s === 'DELETED') return { label: 'Removed', on: false, raw };
    if (s === 'ARCHIVED') return { label: 'Archived', on: false, raw };
    if (s === 'CAMPAIGN_PAUSED') return { label: 'Campaign off', on: false, raw };
    if (s === 'ADSET_PAUSED') return { label: 'Ad set off', on: false, raw };
    if (s === 'PAUSED') return { label: 'Off', on: false, raw };
    if (s === 'IN_PROCESS' || s === 'PENDING_REVIEW') return { label: 'In review', on: true, raw };
    if (s === 'DISAPPROVED') return { label: 'Rejected', on: false, raw };
    if (s === 'WITH_ISSUES') return { label: 'With issues', on: true, raw };
    return { label: pretty(s), on: !/PAUSED|OFF|DISABLED/.test(s), raw };
}

const CHANNEL_LABELS = {
    SEARCH: 'Search', DISPLAY: 'Display', SHOPPING: 'Shopping', VIDEO: 'YouTube / Video', PERFORMANCE_MAX: 'Performance Max',
    DEMAND_GEN: 'Demand Gen', SMART: 'Smart', LOCAL: 'Local', LOCAL_SERVICES: 'Local Services', MULTI_CHANNEL: 'App', HOTEL: 'Hotel', TRAVEL: 'Travel',
};
const META_OBJECTIVES = {
    OUTCOME_LEADS: 'Leads', OUTCOME_SALES: 'Sales', OUTCOME_TRAFFIC: 'Traffic', OUTCOME_ENGAGEMENT: 'Engagement', OUTCOME_AWARENESS: 'Awareness',
    OUTCOME_APP_PROMOTION: 'App promotion', LEAD_GENERATION: 'Leads', MESSAGES: 'Messages', CONVERSIONS: 'Sales', LINK_CLICKS: 'Traffic',
    REACH: 'Awareness', BRAND_AWARENESS: 'Awareness', POST_ENGAGEMENT: 'Engagement', VIDEO_VIEWS: 'Video views', PAGE_LIKES: 'Engagement',
};

/** The "type" a campaign is grouped under in the "What's running" cards. */
export function campaignType(row) {
    if (row.platform === 'google') {
        const ch = googleChannel(row.channelType).toUpperCase();
        return ch ? `Google ${CHANNEL_LABELS[ch] || pretty(ch)}` : 'Google campaigns';
    }
    const obj = String(row.objective || '').toUpperCase();
    return obj ? `Meta ${META_OBJECTIVES[obj] || pretty(obj)}` : 'Meta campaigns';
}

const BID_LABELS = {
    // Meta
    LOWEST_COST_WITHOUT_CAP: 'Highest volume', LOWEST_COST_WITH_BID_CAP: 'Bid cap', COST_CAP: 'Cost per result goal',
    LOWEST_COST_WITH_MIN_ROAS: 'ROAS goal', TARGET_COST: 'Cost per result goal',
    // Google
    TARGET_SPEND: 'Maximize clicks', MAXIMIZE_CONVERSIONS: 'Maximize conversions', MAXIMIZE_CONVERSION_VALUE: 'Maximize conversion value',
    TARGET_CPA: 'Target CPA', TARGET_ROAS: 'Target ROAS', MANUAL_CPC: 'Manual CPC', ENHANCED_CPC: 'Enhanced CPC', TARGET_IMPRESSION_SHARE: 'Target impression share',
    MANUAL_CPM: 'Manual CPM', TARGET_CPM: 'Target CPM', MANUAL_CPV: 'Manual CPV',
};
export function bidStrategyLabel(platform, value) {
    if (!value) return '';
    if (value === 'MIXED') return 'Mixed';
    const raw = platform === 'google' ? googleBidding(value) : String(value);
    return BID_LABELS[raw] || pretty(raw);
}

// "Results" label -> the "Per ..." line Ads Manager shows under Cost per result.
const SINGULAR = {
    'Messaging conversations started': 'messaging conversation started',
    Leads: 'lead', Purchases: 'purchase', Registrations: 'registration', 'Link clicks': 'link click', 'Landing page views': 'landing page view',
    'Post engagements': 'post engagement', 'Page likes': 'page like', Reach: '1,000 people reached', Impressions: '1,000 impressions',
    'Calls placed': 'call placed', 'App installs': 'app install', Contacts: 'contact', ThruPlays: 'ThruPlay', Conversions: 'conversion',
    'Profile visits': 'profile visit', 'Video views': 'video view',
};
export const perResultLabel = (resultType) => (resultType ? `Per ${SINGULAR[resultType] || resultType.toLowerCase()}` : 'Per result');
// Reach and impressions goals are priced per 1,000 like Ads Manager does.
export const costPerResult = (spend, results, resultType) => {
    if (!results) return 0;
    return resultType === 'Reach' || resultType === 'Impressions' ? (spend / results) * 1000 : spend / results;
};

/** Meta attribution_spec -> "7-day click or 1-day view" */
export function formatAttribution(spec) {
    if (!Array.isArray(spec) || !spec.length) return '';
    const parts = spec
        .map((item) => {
            const days = Number(item.window_days || 0);
            const type = String(item.event_type || '').toUpperCase();
            if (!days) return '';
            if (type === 'CLICK_THROUGH') return `${days}-day click`;
            if (type === 'VIEW_THROUGH') return `${days}-day view`;
            if (type === 'ENGAGED_VIDEO_VIEW') return `${days}-day engaged view`;
            return '';
        })
        .filter(Boolean);
    return parts.join(' or ');
}

// Meta budgets come in the currency's minor unit (paise for INR).
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'COP', 'PYG', 'IDR']);
export const metaMoney = (value, currency) => {
    const n = Number(value || 0);
    if (!n) return 0;
    return ZERO_DECIMAL.has(String(currency || '').toUpperCase()) ? n : n / 100;
};

/** PDF report file name: "Acme Pvt Ltd - 01-Nov-2026 to 07-Nov-2026.pdf" (safe on every OS and in HTTP headers). */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function reportFileName(clientName, from, to) {
    const day = (value) => {
        const [y, m, d] = String(value || '').split('-');
        return MONTHS[Number(m) - 1] ? `${d}-${MONTHS[Number(m) - 1]}-${y}` : String(value || '');
    };
    const name = String(clientName || 'All clients')
        .replace(/ · (Google Ads|Meta Ads account)$/, '')
        .replace(/[^\x20-\x7E]+/g, ' ')
        .replace(/[\\/:*?"<>|;%]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80) || 'Ads report';
    return from === to ? `${name} - ${day(from)}.pdf` : `${name} - ${day(from)} to ${day(to)}.pdf`;
}

// Client "websites" are typed by hand and sometimes hold notes ("supplier website"); keep real domains only.
export const isDomain = (value) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(String(value || ''));
export const websiteDomains = (websites = []) => [...new Set(websites.map((url) => String(url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].trim().toLowerCase()).filter(isDomain))];

/** Google Ads Transparency Center + Meta Ad Library links for a client. */
export function transparencyLinks({ name = '', websites = [], metaPageIds = [], country = 'IN' } = {}) {
    const domain = (url) => String(url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].trim();
    const domains = [...new Set(websites.map(domain).filter(isDomain))];
    const pages = [...new Set(metaPageIds.map(String).filter(Boolean))];
    const google = domains.length
        ? domains.map((d) => ({ label: d, url: `https://adstransparency.google.com/?region=${country}&domain=${encodeURIComponent(d)}` }))
        : [{ label: 'Search by name', url: `https://adstransparency.google.com/?region=${country}` }];
    const meta = pages.length
        ? pages.map((id) => ({ label: `Page ${id}`, url: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country}&view_all_page_id=${encodeURIComponent(id)}&search_type=page&media_type=all` }))
        : [{ label: name || 'Search', url: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country}&q=${encodeURIComponent(name)}&search_type=keyword_unordered&media_type=all` }];
    return { google, meta };
}
