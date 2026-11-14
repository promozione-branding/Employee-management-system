// Regression: custom services in New Proposal only.
// Run: node --test components/proposalNew/__tests__/customServiceNew.regression.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const catalog = await import(join(root, "config/new/proposalCatalogNew.js"));

test("catalog builds a stable custom-service category key from a heading", () => {
  assert.equal(typeof catalog.makeCustomServiceCategoryKeyNew, "function");
  assert.equal(catalog.makeCustomServiceCategoryKeyNew("Branding & Design!"), "custom-service:branding-design");
  assert.equal(catalog.isCustomServiceCategoryNew("custom-service:branding-design"), true);
  assert.equal(catalog.isCustomServiceCategoryNew("seo"), false);
});

test("catalog groups custom items + ticked offerings for Checklist/PDF", () => {
  const items = [{ category: "custom-service:branding", categoryLabel: "Branding", label: "Logo Design", customOfferings: ["Logo concepts", "Brand guidelines"] }];
  const checklist = [{ category: "custom-service:branding", section: "Logo Design", items: ["Logo concepts"] }];
  const groups = catalog.getCustomServiceGroupsNew(items, checklist);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, "Branding");
  assert.deepEqual(groups[0].sections, [{ section: "Logo Design", items: ["Logo concepts"] }]);
  const categories = catalog.getCustomServiceChecklistCategoriesNew(items);
  assert.deepEqual(categories[0].checklist, [{ title: "Logo Design", items: ["Logo concepts", "Brand guidelines"] }]);
});

test("edit autofills the custom service form and updates in place (no duplicate)", () => {
  const selector = read("components/proposalNew/SelectorNew.jsx");
  const custom = read("components/proposalNew/CustomServiceNew.jsx");
  assert.match(selector, /customItems/, "Selector must pass saved custom items into the custom form");
  assert.match(selector, /onUpdate=\{updateCustomService\}/, "Selector must wire an in-place update for the custom item");
  assert.match(custom, /editingPackageKey/, "custom form must track which saved item it is editing");
  assert.match(custom, /item\.customOfferings/, "edit must autofill deliverable offerings from the saved item");
  assert.match(custom, /Update Custom Service/, "button must switch to Update while editing a saved custom service");
});

test("custom service is wired through selector, checklist, PDF and DB (New files only)", () => {
  assert.match(read("components/proposalNew/SelectorNew.jsx"), /CustomServiceNew/);
  assert.match(read("components/proposalNew/ChecklistNew.jsx"), /getCustomServiceChecklistCategoriesNew/);
  assert.match(read("components/proposalNew/PdfNew.jsx"), /getCustomServiceGroupsNew/);
  assert.match(read("models/admin/proposalNew/ProposalNew.js"), /customOfferings/);
  assert.match(read("models/admin/proposalNew/ProposalNew.js"), /ChecklistSectionSchema[\s\S]*category/);
  assert.match(read("app/api/proposalNew/[id]/route.js"), /customOfferings: it\.customOfferings/);
});
