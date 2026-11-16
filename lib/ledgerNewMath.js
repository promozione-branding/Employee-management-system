// lib/ledgerNewMath.js
// Single source of truth for New Ledger maths. Genuine and confidential
// entries are two separate ledgers: an entry belongs to exactly one of
// them (isConfidential) and to exactly one proposal (proposalId), and
// the two are never summed together.
//
// Entry semantics (see LedgerModalNew): credit = amount received +
// add-on, extraAmount = the add-on part of that credit. The add-on is
// extra service taken and paid for, so it raises both the service
// total and the credit — it must not be added to credit a second time.

export const isConfidentialEntry = (entry) => Boolean(entry?.isConfidential);

export function filterLedgerEntries(entries, { proposalId, confidential } = {}) {
    const list = Array.isArray(entries) ? entries : [];
    return list.filter((entry) => {
        if (Boolean(confidential) !== isConfidentialEntry(entry)) return false;
        if (proposalId) {
            // Strict: no-proposal entries do not leak into every proposal.
            if (!entry?.proposalId) return false;
            if (String(entry.proposalId) !== String(proposalId)) return false;
        }
        return true;
    });
}

export function hasLedgerEntryForProposal(entries, proposalId) {
    if (!proposalId) return false;
    const list = Array.isArray(entries) ? entries : [];
    // Either ledger counts — genuine OR confidential.
    return list.some((entry) => entry?.proposalId && String(entry.proposalId) === String(proposalId));
}

export function computeLedger(entries, proposalBaseValue = 0) {
    const base = Number(proposalBaseValue) || 0;
    const sorted = [...(Array.isArray(entries) ? entries : [])].sort((a, b) => {
        const byDate = new Date(a?.date || 0) - new Date(b?.date || 0);
        if (byDate !== 0) return byDate;
        return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
    });

    let balance = base;
    const rows = sorted.map((entry) => {
        balance += (Number(entry?.debit) || 0) + (Number(entry?.extraAmount) || 0) - (Number(entry?.credit) || 0);
        return { ...entry, balance };
    });

    const totalAddon = rows.reduce((s, e) => s + (Number(e.extraAmount) || 0), 0);
    const totalDebit = rows.reduce((s, e) => s + (Number(e.debit) || 0), 0);
    const totalCredit = rows.reduce((s, e) => s + (Number(e.credit) || 0), 0);
    const totalServiceUsed = base + totalDebit + totalAddon;

    return {
        rows,
        totalAddon,
        totalCredit,
        totalServiceUsed,
        remainingBalance: totalServiceUsed - totalCredit,
    };
}
