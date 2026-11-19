// tests/invoice-new.test.mjs — Run: node --test tests/invoice-new.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { buildInvoiceCcList, buildInvoiceFromProposal, computeInvoiceTotals } from '../lib/invoiceNew.js';

const proposal = {
    _id: 'prop1',
    proposalNumber: 'PROP-2026-0007',
    clientId: 'cust1',
    items: [
        { category: 'seo', categoryLabel: 'SEO', packageKey: 'seo-basic', label: 'SEO Basic', duration: '3m', durationLabel: '3 Months', amount: 50000, serviceDiscount: 5000 },
        { category: 'ads', categoryLabel: 'Ads', packageKey: 'ads-pro', label: 'Ads Pro', duration: '1m', durationLabel: '1 Month', amount: 30000, serviceDiscount: 0, customOfferings: ['Setup'] },
    ],
    discountType: 'percentage',
    discountInput: 10,
    tdsApplicable: true,
    partialPayments: [{ paymentDuration: 'Advance Payment', paymentAmount: 82600 }],
    paymentMethod: 'upi',
    notes: 'Proposal note',
};

test('totals match the proposal formula (subtotal, discounts, GST 18%, TDS 2%)', () => {
    const t = computeInvoiceTotals(proposal);
    assert.equal(t.subtotal, 80000);
    assert.equal(t.serviceDiscountAmount, 5000);
    assert.equal(t.discountAmount, 8000); // 10% global
    assert.equal(t.baseAfterDiscount, 67000);
    assert.equal(t.gstAmount, 12060);
    assert.equal(t.tdsAmount, 1340);
    assert.equal(t.grandTotal, 77720);
});

test('invoice snapshots proposal offerings and references, totals carried over', () => {
    const inv = buildInvoiceFromProposal(proposal, { invoiceDate: '2026-11-19', notes: '' });
    assert.equal(inv.proposalId, 'prop1');
    assert.equal(inv.proposalNumber, 'PROP-2026-0007');
    assert.equal(inv.clientId, 'cust1');
    assert.equal(inv.items.length, 2);
    assert.equal(inv.items[0].label, 'SEO Basic');
    assert.equal(inv.items[0].categoryLabel, 'SEO');
    assert.deepEqual(inv.items[1].customOfferings, ['Setup']);
    assert.equal(inv.grandTotal, 77720);
    assert.equal(inv.notes, 'Proposal note'); // falls back to proposal notes
    assert.equal(inv.status, 'draft');
});

test('invoice without items is rejected; explicit notes/due date win', () => {
    assert.throws(() => buildInvoiceFromProposal({ ...proposal, items: [] }), /at least one/i);
    const inv = buildInvoiceFromProposal(proposal, { notes: 'Pay in 7 days', dueDate: '2026-11-26' });
    assert.equal(inv.notes, 'Pay in 7 days');
    assert.equal(inv.dueDate, '2026-11-26');
});

test('invoice mail CC: admins only, deduped, recipient excluded, invalid dropped', () => {
    assert.deepEqual(buildInvoiceCcList(['Admin@X.com', 'admin@x.com', 'bad', 'client@y.com', ''], 'Client@y.com'), ['admin@x.com']);
    assert.deepEqual(buildInvoiceCcList([], 'a@b.com'), []);
});

test('amount discount type and no-TDS case', () => {
    const t = computeInvoiceTotals({ items: [{ amount: 10000, serviceDiscount: 0 }], discountType: 'amount', discountInput: 1000, tdsApplicable: false });
    assert.equal(t.baseAfterDiscount, 9000);
    assert.equal(t.gstAmount, 1620);
    assert.equal(t.tdsAmount, 0);
    assert.equal(t.grandTotal, 10620);
});
