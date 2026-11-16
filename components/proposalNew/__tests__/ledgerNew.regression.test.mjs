// Regression: genuine vs confidential Ledger (New) must never mix, and
// Create Workflow requires a ledger entry for the selected proposal.
// Run: node --test components/proposalNew/__tests__/ledgerNew.regression.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const math = await import(join(root, "lib/ledgerNewMath.js"));

const entries = [
  { _id: "g1", proposalId: "p1", isConfidential: false, date: "2026-01-02", credit: 40000, debit: 0, extraAmount: 5000 },
  { _id: "c1", proposalId: "p1", isConfidential: true, date: "2026-01-03", credit: 30000, debit: 0, extraAmount: 0 },
  { _id: "g2", proposalId: "p2", isConfidential: false, date: "2026-01-04", credit: 10000, debit: 0, extraAmount: 0 },
  { _id: "orphan", proposalId: null, isConfidential: false, date: "2026-01-05", credit: 9999, debit: 0, extraAmount: 0 },
];

test("genuine ledger shows only genuine entries of the selected proposal", () => {
  const rows = math.filterLedgerEntries(entries, { proposalId: "p1", confidential: false });
  assert.deepEqual(rows.map((e) => e._id), ["g1"]);
});

test("confidential ledger shows only confidential entries, never genuine ones", () => {
  const rows = math.filterLedgerEntries(entries, { proposalId: "p1", confidential: true });
  assert.deepEqual(rows.map((e) => e._id), ["c1"]);
  const p2 = math.filterLedgerEntries(entries, { proposalId: "p2", confidential: true });
  assert.deepEqual(p2, []);
});

test("totals and running balance are calculated per ledger, not mixed", () => {
  const genuine = math.computeLedger(
    math.filterLedgerEntries(entries, { proposalId: "p1", confidential: false }),
    100000,
  );
  // Service = proposal 100000 + add-on 5000; Paid = credit 40000 (add-on already inside credit)
  assert.equal(genuine.totalAddon, 5000);
  assert.equal(genuine.totalServiceUsed, 105000);
  assert.equal(genuine.totalCredit, 40000);
  assert.equal(genuine.remainingBalance, 65000);
  assert.equal(genuine.rows[0].balance, 65000);

  const confidential = math.computeLedger(
    math.filterLedgerEntries(entries, { proposalId: "p1", confidential: true }),
    100000,
  );
  assert.equal(confidential.totalCredit, 30000);
  assert.equal(confidential.remainingBalance, 70000);
  assert.equal(confidential.rows[0].balance, 70000);
});

test("workflow gate: a ledger entry in either ledger counts, other proposals do not", () => {
  assert.equal(math.hasLedgerEntryForProposal(entries, "p1"), true);
  assert.equal(math.hasLedgerEntryForProposal(entries, "p2"), true);
  assert.equal(math.hasLedgerEntryForProposal(entries, "p-unknown"), false);
  assert.equal(math.hasLedgerEntryForProposal([], "p1"), false);
});

test("wiring: ledger tab, modal, workflow UI and workflow API enforce the rules", () => {
  assert.match(read("components/proposalNew/LedgerTabNew.jsx"), /filterLedgerEntries/);
  assert.match(read("components/proposalNew/LedgerTabNew.jsx"), /computeLedger/);
  assert.match(read("components/admin-dashboard/tabs/Createworkflow.jsx"), /Kindly make entry on ledger to continue/);
  assert.match(read("components/admin-dashboard/tabs/Createworkflow.jsx"), /hasLedgerEntryForProposal/);
  assert.match(read("app/api/workflow/create/route.js"), /Kindly make entry on ledger to continue/);
  assert.match(read("app/api/workflow/create/route.js"), /LedgerNew/);
});
