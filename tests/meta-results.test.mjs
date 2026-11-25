import test from 'node:test';
import assert from 'node:assert/strict';
import { metaResultFromActions } from '../lib/metaResults.js';

test('counts messaging conversations started as results', () => {
    const result = metaResultFromActions([
        { action_type: 'onsite_conversion.messaging_conversation_started_7d', value: '45' },
        { action_type: 'link_click', value: '120' },
    ]);
    assert.equal(result.conversions, 45);
    assert.equal(result.resultType, 'Messaging conversations started');
    // User's screenshot: ₹2,536.82 spent / 45 results = ₹56.37 per result
    assert.equal((2536.82 / result.conversions).toFixed(2), '56.37');
});

test('does not double-count messaging aliases for the same event', () => {
    const result = metaResultFromActions([
        { action_type: 'onsite_conversion.messaging_conversation_started_7d', value: 45 },
        { action_type: 'messaging_conversation_started_7d', value: 45 },
    ]);
    assert.equal(result.conversions, 45);
});

test('still counts leads, purchases and registrations', () => {
    assert.equal(metaResultFromActions([{ action_type: 'lead', value: 3 }]).conversions, 3);
    assert.equal(metaResultFromActions([{ action_type: 'purchase', value: 2 }]).conversions, 2);
    assert.equal(metaResultFromActions([{ action_type: 'complete_registration', value: 1 }]).resultType, 'Registrations');
});

test('unknown or empty actions give zero results', () => {
    assert.deepEqual(metaResultFromActions([]), { conversions: 0, resultType: '' });
    assert.deepEqual(metaResultFromActions([{ action_type: 'page_engaged', value: 9 }]), { conversions: 0, resultType: '' });
    assert.deepEqual(metaResultFromActions(undefined), { conversions: 0, resultType: '' });
});

import { metaResultForGoal } from '../lib/metaResults.js';
import { formatAttribution, metaMoney, deliveryOf, splitKeyword, perResultLabel, transparencyLinks } from '../lib/adsLabels.js';

test('goal-based results count only the optimised result, like Ads Manager', () => {
    const actions = [
        { action_type: 'onsite_conversion.messaging_conversation_started_7d', value: '45' },
        { action_type: 'lead', value: '3' },
        { action_type: 'link_click', value: '120' },
    ];
    assert.deepEqual(metaResultForGoal(actions, 'CONVERSATIONS'), { conversions: 45, resultType: 'Messaging conversations started' });
    assert.deepEqual(metaResultForGoal(actions, 'LINK_CLICKS'), { conversions: 120, resultType: 'Link clicks' });
    assert.deepEqual(metaResultForGoal(actions, 'OFFSITE_CONVERSIONS', { custom_event_type: 'LEAD' }), { conversions: 3, resultType: 'Leads' });
    assert.deepEqual(metaResultForGoal([], 'REACH', null, { reach: 900 }), { conversions: 900, resultType: 'Reach' });
    assert.equal(metaResultForGoal(actions, 'SOMETHING_NEW'), null);
    assert.deepEqual(metaResultForGoal([], 'CONVERSATIONS'), { conversions: 0, resultType: 'Messaging conversations started' });
});

test('ads labels match Ads Manager wording', () => {
    assert.equal(formatAttribution([{ event_type: 'CLICK_THROUGH', window_days: 7 }, { event_type: 'VIEW_THROUGH', window_days: 1 }]), '7-day click or 1-day view');
    assert.equal(metaMoney('30000', 'INR'), 300);
    assert.equal(perResultLabel('Messaging conversations started'), 'Per messaging conversation started');
    assert.deepEqual(deliveryOf('google', '3'), { label: 'Off', on: false, raw: 'PAUSED' });
    assert.equal(deliveryOf('meta', 'ACTIVE').label, 'Active');
    assert.deepEqual(splitKeyword('titanium dioxide for paints (4)'), { text: 'titanium dioxide for paints', match: 'Broad' });
    const links = transparencyLinks({ name: 'Acme', websites: ['https://www.acme.in/shop'], metaPageIds: ['123'] });
    assert.match(links.google[0].url, /domain=acme\.in/);
    assert.match(links.meta[0].url, /view_all_page_id=123/);
});

test('metaResultFromResultsField: uses Meta\'s own Results number', async () => {
    const { metaResultFromResultsField } = await import('../lib/metaResults.js');
    assert.deepEqual(
        metaResultFromResultsField([{ indicator: 'actions:onsite_conversion.messaging_conversation_started_7d', values: [{ value: '45', attribution_windows: ['default'] }] }]),
        { conversions: 45, resultType: 'Messaging conversations started' }
    );
    assert.deepEqual(metaResultFromResultsField([{ indicator: 'actions:lead', values: [{ value: '3' }] }]), { conversions: 3, resultType: 'Leads' });
    assert.deepEqual(metaResultFromResultsField([{ indicator: 'reach', values: [{ value: '1200' }] }]), { conversions: 1200, resultType: 'Reach' });
    // No value sent (instant-form lead ad sets) -> null so the goal-based fallback runs.
    assert.equal(metaResultFromResultsField([{ indicator: 'actions:lead' }]), null);
    assert.equal(metaResultFromResultsField(undefined), null);
});
