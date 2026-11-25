// lib/metaResults.js
// Pure helper: turn Meta `actions` into result count + label.
// Aliases for the same event are grouped and counted once (max in group),
// different result types are summed.

const RESULT_GROUPS = [
    {
        resultType: 'Messaging conversations started',
        actionTypes: [
            'onsite_conversion.messaging_conversation_started_7d',
            'onsite_conversion.messaging_conversation_started_28d',
            'messaging_conversation_started_7d',
            'messaging_conversation_started_28d',
        ],
    },
    {
        resultType: 'Leads',
        actionTypes: ['lead', 'onsite_conversion.lead_grouped', 'generate_lead'],
    },
    {
        resultType: 'Purchases',
        actionTypes: ['purchase', 'omni_purchase', 'onsite_conversion.purchase'],
    },
    {
        resultType: 'Registrations',
        actionTypes: ['complete_registration', 'onsite_conversion.complete_registration'],
    },
];

export function metaResultFromActions(actions) {
    if (!Array.isArray(actions) || !actions.length) return { conversions: 0, resultType: '' };
    const byType = new Map(actions.map((a) => [a.action_type, Number(a.value || 0)]));
    let conversions = 0;
    let resultType = '';
    let largest = 0;
    for (const group of RESULT_GROUPS) {
        const value = Math.max(0, ...group.actionTypes.map((type) => byType.get(type) || 0));
        if (!value) continue;
        conversions += value;
        if (value > largest) {
            largest = value;
            resultType = group.resultType;
        }
    }
    return { conversions, resultType };
}

// ── Ads Manager-style "Results" ─────────────────────────────────────────────
// Ads Manager counts the single result its ad set is optimised for (the
// optimization_goal + promoted_object), not every action that happened.
// Returns null when the goal is unknown so callers fall back to the helper above.
const PIXEL_EVENTS = {
    LEAD: { resultType: 'Leads', actionTypes: ['offsite_conversion.fb_pixel_lead', 'lead', 'onsite_web_lead'] },
    PURCHASE: { resultType: 'Purchases', actionTypes: ['offsite_conversion.fb_pixel_purchase', 'omni_purchase', 'purchase'] },
    COMPLETE_REGISTRATION: { resultType: 'Registrations', actionTypes: ['offsite_conversion.fb_pixel_complete_registration', 'complete_registration'] },
    CONTACT: { resultType: 'Contacts', actionTypes: ['offsite_conversion.fb_pixel_contact', 'contact_total', 'contact'] },
    ADD_TO_CART: { resultType: 'Adds to cart', actionTypes: ['offsite_conversion.fb_pixel_add_to_cart', 'omni_add_to_cart', 'add_to_cart'] },
    INITIATED_CHECKOUT: { resultType: 'Checkouts initiated', actionTypes: ['offsite_conversion.fb_pixel_initiate_checkout', 'omni_initiated_checkout', 'initiate_checkout'] },
    SUBMIT_APPLICATION: { resultType: 'Applications submitted', actionTypes: ['offsite_conversion.fb_pixel_submit_application', 'submit_application_total'] },
    SCHEDULE: { resultType: 'Schedules', actionTypes: ['offsite_conversion.fb_pixel_schedule', 'schedule_total'] },
};
const GOALS = {
    CONVERSATIONS: { resultType: 'Messaging conversations started', actionTypes: RESULT_GROUPS[0].actionTypes },
    LEAD_GENERATION: { resultType: 'Leads', actionTypes: ['onsite_conversion.lead_grouped', 'lead', 'leadgen_grouped'] },
    QUALITY_LEAD: { resultType: 'Leads', actionTypes: ['onsite_conversion.lead_grouped', 'lead', 'leadgen_grouped'] },
    LINK_CLICKS: { resultType: 'Link clicks', actionTypes: ['link_click'] },
    LANDING_PAGE_VIEWS: { resultType: 'Landing page views', actionTypes: ['landing_page_view', 'omni_landing_page_view'] },
    POST_ENGAGEMENT: { resultType: 'Post engagements', actionTypes: ['post_engagement'] },
    PAGE_LIKES: { resultType: 'Page likes', actionTypes: ['like'] },
    QUALITY_CALL: { resultType: 'Calls placed', actionTypes: ['click_to_call_native_call_placed', 'onsite_conversion.call_confirm_grouped'] },
    APP_INSTALLS: { resultType: 'App installs', actionTypes: ['mobile_app_install', 'app_install', 'omni_app_install'] },
    VISIT_INSTAGRAM_PROFILE: { resultType: 'Profile visits', actionTypes: ['ig_profile_visit', 'instagram_profile_visit'] },
    PROFILE_VISIT: { resultType: 'Profile visits', actionTypes: ['ig_profile_visit', 'instagram_profile_visit'] },
    REACH: { resultType: 'Reach', metric: 'reach' },
    IMPRESSIONS: { resultType: 'Impressions', metric: 'impressions' },
};

// ── Meta's own "results" field ───────────────────────────────────────────────
// Insights can return `results: [{ indicator: 'actions:<type>', values: [{ value }] }]`,
// the exact number Ads Manager shows in its Results column. Preferred when present;
// returns null when Meta did not send a value (e.g. instant-form lead ad sets).
const INDICATOR_LABELS = {
    'onsite_conversion.messaging_conversation_started_7d': 'Messaging conversations started',
    'onsite_conversion.messaging_conversation_started_28d': 'Messaging conversations started',
    'messaging_conversation_started_7d': 'Messaging conversations started',
    'onsite_conversion.lead_grouped': 'Leads', lead: 'Leads', leadgen_grouped: 'Leads', 'offsite_conversion.fb_pixel_lead': 'Leads', onsite_web_lead: 'Leads',
    link_click: 'Link clicks', landing_page_view: 'Landing page views', omni_landing_page_view: 'Landing page views',
    post_engagement: 'Post engagements', like: 'Page likes',
    click_to_call_native_call_placed: 'Calls placed', 'onsite_conversion.call_confirm_grouped': 'Calls placed', call_confirm_grouped: 'Calls placed',
    purchase: 'Purchases', omni_purchase: 'Purchases', 'offsite_conversion.fb_pixel_purchase': 'Purchases', 'onsite_conversion.purchase': 'Purchases',
    complete_registration: 'Registrations', 'offsite_conversion.fb_pixel_complete_registration': 'Registrations',
    'offsite_conversion.fb_pixel_contact': 'Contacts', contact_total: 'Contacts',
    'offsite_conversion.fb_pixel_add_to_cart': 'Adds to cart', 'offsite_conversion.fb_pixel_initiate_checkout': 'Checkouts initiated',
    mobile_app_install: 'App installs', app_install: 'App installs', omni_app_install: 'App installs',
    video_thruplay_watched: 'ThruPlays', video_view: 'Video views', ig_profile_visit: 'Profile visits', instagram_profile_visit: 'Profile visits',
    reach: 'Reach', impressions: 'Impressions', total_profile_visits: 'Profile visits',
};
const prettyIndicator = (type) => String(type || '').replace(/^(onsite_conversion|offsite_conversion)\./, '').replace(/^fb_pixel_/, '').replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());

export function metaResultFromResultsField(results) {
    const item = Array.isArray(results) ? results.find((r) => r?.indicator) : null;
    const raw = item?.values?.[0]?.value;
    if (!item || raw === undefined || raw === null || raw === '') return null;
    const type = String(item.indicator).replace(/^actions:/, '');
    return { conversions: Number(raw) || 0, resultType: INDICATOR_LABELS[type] || prettyIndicator(type) };
}

export function metaResultForGoal(actions, optimizationGoal, promotedObject, metrics = {}) {
    const goal = String(optimizationGoal || '').toUpperCase();
    let spec = GOALS[goal];
    if (!spec && ['OFFSITE_CONVERSIONS', 'VALUE', 'CONVERSIONS'].includes(goal)) {
        spec = PIXEL_EVENTS[String(promotedObject?.custom_event_type || '').toUpperCase()];
    }
    if (!spec) return null;
    if (spec.metric) return { conversions: Number(metrics[spec.metric] || 0), resultType: spec.resultType };
    const byType = new Map((Array.isArray(actions) ? actions : []).map((a) => [a.action_type, Number(a.value || 0)]));
    // Aliases describe the same event, so take the largest rather than adding them.
    return { conversions: Math.max(0, ...spec.actionTypes.map((type) => byType.get(type) || 0)), resultType: spec.resultType };
}
