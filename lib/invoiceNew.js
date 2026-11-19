// lib/invoiceNew.js
// Pure proposal → invoice mapping for the New Invoice flow. Mirrors the
// proposal totals formula exactly (see components/proposalNew/SummaryNew.jsx
// and app/api/proposalNew/route.js) so a generated invoice always totals
// the same as the proposal it came from.

const round0 = (n) => Math.round(Number(n) || 0);

export function computeInvoiceTotals({ items = [], discountType = 'amount', discountInput = 0, tdsApplicable = false, gstRate = 0.18, tdsRate = 0.02 } = {}) {
    const subtotal = round0(items.reduce((s, it) => s + Number(it.amount || 0), 0));
    const serviceDiscountAmount = round0(items.reduce((s, it) => s + Number(it.serviceDiscount || 0), 0));
    const globalDiscountAmount = discountType === 'percentage' ? round0((subtotal * Number(discountInput || 0)) / 100) : round0(discountInput || 0);
    const discountAmount = round0(serviceDiscountAmount + globalDiscountAmount);
    const baseAfterDiscount = round0(subtotal - discountAmount);
    const gstAmount = round0(baseAfterDiscount * gstRate);
    const tdsAmount = tdsApplicable ? round0(baseAfterDiscount * tdsRate) : 0;
    const grandTotal = round0(baseAfterDiscount + gstAmount - tdsAmount);
    return { subtotal, serviceDiscountAmount, discountAmount: globalDiscountAmount, totalDiscountAmount: discountAmount, baseAfterDiscount, gstAmount, tdsAmount, grandTotal };
}

/** Admin CC list for invoice mail: valid, de-duplicated, never CC-ing the recipient. */
export function buildInvoiceCcList(adminEmails = [], targetEmail = '') {
    const target = String(targetEmail || '').trim().toLowerCase();
    return [...new Set((adminEmails || []).map((e) => String(e || '').trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e !== target))];
}

/** Snapshot a proposal into invoice data. Throws when it has no offerings. */
export function buildInvoiceFromProposal(proposal, overrides = {}) {
    if (!proposal || !Array.isArray(proposal.items) || !proposal.items.length) {
        throw new Error('Proposal has at least one offering required to generate an invoice');
    }
    const totals = computeInvoiceTotals(proposal);
    return {
        clientId: String(proposal.clientId?._id ?? proposal.clientId ?? ''),
        proposalId: String(proposal._id ?? ''),
        proposalNumber: proposal.proposalNumber || '',
        items: proposal.items.map((it) => ({
            category: it.category || '',
            categoryLabel: it.categoryLabel || '',
            packageKey: it.packageKey || '',
            label: it.label || '',
            duration: it.duration || '',
            durationLabel: it.durationLabel || '',
            amount: Number(it.amount || 0),
            serviceDiscount: Number(it.serviceDiscount || 0),
            custom: !!it.custom,
            customOfferings: Array.isArray(it.customOfferings) ? it.customOfferings.map(String) : [],
            cityName: it.cityName || '',
            cityCount: it.cityCount || '',
            keywordName: it.keywordName || '',
            keywordCount: it.keywordCount || '',
        })),
        categoryNotes: proposal.categoryNotes || [],
        cityPages: proposal.cityPages || [],
        partialPayments: (proposal.partialPayments || []).map((p) => ({ paymentDuration: p.paymentDuration, paymentAmount: Number(p.paymentAmount || 0) })),
        paymentMethod: proposal.paymentMethod || '',
        discountType: proposal.discountType || 'amount',
        discountInput: Number(proposal.discountInput || 0),
        tdsApplicable: !!proposal.tdsApplicable,
        gstRate: 0.18,
        tdsRate: 0.02,
        ...totals,
        discountAmount: totals.totalDiscountAmount,
        notes: overrides.notes?.trim() ? overrides.notes.trim() : proposal.notes || '',
        invoiceDate: overrides.invoiceDate || '',
        dueDate: overrides.dueDate || '',
        status: overrides.status || 'draft',
    };
}
