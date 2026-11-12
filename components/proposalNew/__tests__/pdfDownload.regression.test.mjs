// Regression: centered "Proposal" title visible in Preview must also print on Download.
// Run: node --test components/proposalNew/__tests__/pdfDownload.regression.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..");
const pdf = readFileSync(join(dir, "PdfNew.jsx"), "utf8");
const history = readFileSync(join(dir, "HistoryNew.jsx"), "utf8");
const preview = readFileSync(join(dir, "PreviewNew.jsx"), "utf8");

const printBlock = pdf.slice(pdf.indexOf("@media print"));

test("print page top padding clears the fixed header so the title is not covered", () => {
  // Fixed header: top:8mm + 110px logo (~29.1mm) + padding/border ~= 38mm.
  const m = printBlock.match(/\.pdf-screen-page\s*\{[^}]*padding:\s*([\d.]+)mm/);
  assert.ok(m, "print .pdf-screen-page padding-top must be declared");
  assert.ok(Number(m[1]) >= 38, `padding-top ${m[1]}mm overlaps fixed header (~38mm); title is painted under its white background`);
});

test("printed page body stacks above the fixed header/watermark", () => {
  const body = printBlock.match(/\.pdf-page-body\s*\{[^}]*z-index:\s*(\d+)/);
  const header = printBlock.match(/\.pdf-header-fixed\s*\{[^}]*z-index:\s*(\d+)/);
  assert.ok(body && header, "print CSS must give .pdf-page-body and .pdf-header-fixed explicit z-index");
  assert.ok(Number(body[1]) > Number(header[1]), ".pdf-page-body (contains .proposal-title) must stack above .pdf-header-fixed; inner z-index on the title cannot escape the body's stacking context");
});

test("download waits for the print window/images instead of a blind timeout", () => {
  assert.match(pdf, /downloadProposalPdf[\s\S]*?onload|addEventListener\(["']load/, "downloadProposalPdf must wait for load before print()");
  assert.doesNotMatch(pdf, /setTimeout\(\(\) => \{ win\.focus\(\); win\.print\(\); \}, 500\)/, "blind 500ms print races logo/image loading");
});

test("History download is driven by the rendered preview, not a 350ms guess", () => {
  assert.doesNotMatch(history, /setTimeout\(\(\) => \{\s*downloadProposalPdf/, "setTimeout(350) can clone a missing/stale #proposal-print-root");
  assert.match(history, /useEffect/, "download must react to preview being committed to the DOM");
});

test("Preview and History use the same downloadProposalPdf entry point", () => {
  assert.match(preview, /downloadProposalPdf\(proposal, printRef\.current\)/);
  assert.match(history, /downloadProposalPdf/);
});
