import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdsReport, cleanClientName, periodLabelFor } from '../lib/adsReportData.js';

const metaRow = (over = {}) => ({
    platform: 'meta', level: 'campaign', date: '2026-11-20', accountId: 'act_1', entityId: 'c1',
    campaign: 'New Leads campaign', clientName: 'Acme · Meta Ads account', status: 'ACTIVE',
    currency: 'INR', impressions: 36705, clicks: 900, spend: 2536.82, reach: 20100,
    conversions: 45, resultType: 'Messaging conversations started', ...over,
});

test('selected client name is cleaned for the PDF cover', () => {
    assert.equal(cleanClientName('Acme · Meta Ads account'), 'Acme');
    assert.equal(cleanClientName('Acme · Google Ads account'), 'Acme');
    assert.equal(cleanClientName('  Acme Ltd  '), 'Acme Ltd');
    assert.equal(cleanClientName(''), 'All clients');
    assert.equal(cleanClientName(null), 'All clients');
});

test('weekly and monthly period labels', () => {
    assert.equal(periodLabelFor('weekly', '2026-11-17', '2026-11-23'), 'Weekly Performance Report');
    assert.equal(periodLabelFor('monthly', '2026-10-25', '2026-11-23'), 'Monthly Performance Report');
    assert.equal(periodLabelFor('', '2026-11-17', '2026-11-23'), 'Weekly Performance Report');
    assert.equal(periodLabelFor('', '2026-10-25', '2026-11-23'), 'Monthly Performance Report');
    assert.equal(periodLabelFor('', '2026-11-01', '2026-11-23'), 'Performance Report');
});

test('only platforms with activity get a section - no empty Google page', () => {
    const report = buildAdsReport({ rows: [metaRow()], from: '2026-11-17', to: '2026-11-23', clientName: 'Acme · Meta Ads account', platform: 'all', period: 'weekly' });
    assert.equal(report.clientName, 'Acme');
    assert.equal(report.isEmpty, false);
    assert.equal(report.sections.length, 1);
    assert.equal(report.sections[0].name, 'meta');
    const s = report.sections[0];
    assert.equal(s.totals.impressions, 36705);
    assert.equal(s.totals.spend, 2536.82);
    assert.equal(s.totals.conversions, 45);
    assert.equal(s.totals.costPerResult.toFixed(2), '56.37');
    assert.equal(s.resultType, 'Messaging conversations started');
    assert.equal(s.hasReach, true);
});

test('off / zero-spend campaigns and void rows are dropped, nothing null leaks', () => {
    const rows = [
        metaRow(),
        metaRow({ entityId: 'c2', campaign: 'New Leads campaign (off)', status: 'PAUSED', impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0, resultType: '' }),
        { platform: 'meta', level: 'keyword', date: '2026-11-20', accountId: 'act_1', entityId: 'k1', campaign: 'New Leads campaign', keyword: '', entity: '', clicks: 0, spend: 0, impressions: 0, conversions: 0 },
        { platform: 'google', level: 'campaign', date: '2026-11-20', accountId: 'g1', entityId: 'g1c', campaign: null, impressions: 0, clicks: 0, spend: 0, conversions: 0 },
    ];
    const report = buildAdsReport({ rows, from: '2026-11-17', to: '2026-11-23', clientName: 'Acme', platform: 'all' });
    assert.equal(report.sections.length, 1);
    assert.equal(report.sections[0].campaigns.length, 1);
    assert.equal(report.sections[0].details.length, 0);
    const json = JSON.stringify(report);
    assert.ok(!json.includes('null'), 'no null in report model');
    assert.ok(!json.includes('undefined'), 'no undefined in report model');
    assert.ok(!json.includes('NaN'), 'no NaN in report model');
});

test('daily table sums campaign rows per date in the selected range', () => {
    const rows = [
        metaRow({ date: '2026-11-20', impressions: 100, spend: 100, conversions: 2 }),
        metaRow({ date: '2026-11-20', entityId: 'c9', campaign: 'Other', impressions: 50, spend: 50, conversions: 1 }),
        metaRow({ date: '2026-11-21', impressions: 200, spend: 300, conversions: 4 }),
    ];
    const report = buildAdsReport({ rows, from: '2026-11-20', to: '2026-11-21', clientName: 'Acme', platform: 'meta' });
    assert.deepEqual(report.sections[0].daily.map((d) => [d.date, d.impressions, d.spend, d.conversions]), [
        ['2026-11-20', 150, 150, 3],
        ['2026-11-21', 200, 300, 4],
    ]);
});

test('no activity is an explicit empty report, not void sections', () => {
    const report = buildAdsReport({ rows: [], from: '2026-11-17', to: '2026-11-23', clientName: 'Acme', platform: 'all' });
    assert.equal(report.isEmpty, true);
    assert.equal(report.sections.length, 0);
    assert.equal(report.clientName, 'Acme');
});
