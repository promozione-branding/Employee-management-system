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
