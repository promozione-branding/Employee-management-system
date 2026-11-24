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
