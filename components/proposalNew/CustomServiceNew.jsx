// components/proposalNew/CustomServiceNew.jsx

"use client";
import React, { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { makeCustomServiceCategoryKeyNew } from "@/config/new/proposalCatalogNew";

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";

const CustomServiceNew = ({ onAdd, customItems = [], onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState("");
  const [offeringName, setOfferingName] = useState("");
  const [tenure, setTenure] = useState("");
  const [price, setPrice] = useState("");
  const [offeringInput, setOfferingInput] = useState("");
  const [offerings, setOfferings] = useState([]);
  const [editingPackageKey, setEditingPackageKey] = useState(null);
  const [loadedSig, setLoadedSig] = useState(null);
  const [suppressAutofill, setSuppressAutofill] = useState(false);

  const loadItem = (entry) => {
    setHeading(entry.item.categoryLabel || "");
    setOfferingName(entry.item.label || "");
    setTenure(entry.item.durationLabel || "");
    setPrice(entry.item.amount ?? "");
    setOfferings([...(entry.item.customOfferings || [])]);
    setOfferingInput("");
    setEditingPackageKey(entry.item.packageKey);
    setOpen(true);
  };

  // Autofill when saved custom items arrive from outside (History → Edit):
  // adjust state during render so the form shows the saved values.
  const externalSig = customItems.map(({ item }) => item.packageKey).join("|");
  const editingEntry = customItems.find(
    ({ item }) => item.packageKey === editingPackageKey,
  );
  if (externalSig && externalSig !== loadedSig && !suppressAutofill && !editingEntry) {
    const first = customItems[0];
    setLoadedSig(externalSig);
    setEditingPackageKey(first.item.packageKey);
    setOpen(true);
    setHeading(first.item.categoryLabel || "");
    setOfferingName(first.item.label || "");
    setTenure(first.item.durationLabel || "");
    setPrice(first.item.amount ?? "");
    setOfferings([...(first.item.customOfferings || [])]);
  }

  const addOffering = () => {
    const value = offeringInput.trim();
    if (!value) return;
    setOfferings((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setOfferingInput("");
  };

  const canAdd =
    heading.trim() && offeringName.trim() && tenure.trim() && Number(price) > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const category = makeCustomServiceCategoryKeyNew(heading);
    const customOfferings = [...offerings];
    const checklistEntry = customOfferings.length
      ? { category, section: offeringName.trim(), items: customOfferings }
      : null;

    if (editingEntry && onUpdate) {
      // Update the saved item in place — never add a duplicate on edit.
      onUpdate(
        editingEntry.index,
        editingEntry.item,
        {
          ...editingEntry.item,
          category,
          categoryLabel: heading.trim(),
          label: offeringName.trim(),
          duration: `custom::${tenure.trim()}`,
          durationLabel: tenure.trim(),
          amount: Number(price),
          custom: true,
          customOfferings,
        },
        checklistEntry,
      );
      setEditingPackageKey(null);
    } else if (onAdd) {
      setSuppressAutofill(true);
      onAdd(
        {
          category,
          categoryLabel: heading.trim(),
          packageKey: `custom-offering-${Date.now()}`,
          label: offeringName.trim(),
          duration: `custom::${tenure.trim()}`,
          durationLabel: tenure.trim(),
          amount: Number(price),
          serviceDiscount: 0,
          custom: true,
          customOfferings,
        },
        checklistEntry,
      );
    }
    // Keep the heading so more offerings can be added under the same service.
    setOfferingName("");
    setTenure("");
    setPrice("");
    setOfferings([]);
    setOfferingInput("");
  };

  const cancelEdit = () => {
    setEditingPackageKey(null);
    setLoadedSig(externalSig);
    setOfferingName("");
    setTenure("");
    setPrice("");
    setOfferings([]);
    setOfferingInput("");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-800">Custom Service</h3>
            <p className="text-xs text-gray-500">
              Add your own service heading, offerings, time and price
            </p>
          </div>
        </div>
        <Plus
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1.5 block">
                Service Heading
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Branding"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1.5 block">
                Sub-category / Offering Name
              </label>
              <input
                type="text"
                value={offeringName}
                onChange={(e) => setOfferingName(e.target.value)}
                placeholder="e.g. Logo Design"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1.5 block">
                Time / Tenure
              </label>
              <input
                type="text"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="e.g. 2 Months"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1.5 block">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1.5 block">
              Deliverable Offerings (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={offeringInput}
                onChange={(e) => setOfferingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOffering();
                  }
                }}
                placeholder="e.g. Logo concepts"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addOffering}
                className="shrink-0 bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Add
              </button>
            </div>
            {offerings.length > 0 && (
              <ul className="flex flex-wrap gap-2 mt-2">
                {offerings.map((offering) => (
                  <li
                    key={offering}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-800"
                  >
                    <span>{offering}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setOfferings((prev) => prev.filter((o) => o !== offering))
                      }
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remove ${offering}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className={`text-sm font-medium rounded-md py-2 transition ${
              canAdd
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {editingEntry ? "Update Custom Service" : "Add Custom Service"}
          </button>

          {editingEntry && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
              Cancel edit
            </button>
          )}

          {customItems.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                Added Custom Services
              </p>
              <ul className="flex flex-col gap-2">
                {customItems.map((entry) => (
                  <li
                    key={entry.item.packageKey}
                    className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-gray-800">
                      <span className="font-medium">{entry.item.label}</span>
                      <span className="text-gray-500">
                        {" "}
                        · {entry.item.categoryLabel}
                        {entry.item.durationLabel ? ` · ${entry.item.durationLabel}` : ""} · ₹{" "}
                        {Number(entry.item.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => loadItem(entry)}
                      className="shrink-0 text-xs font-medium text-gray-700 hover:underline"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomServiceNew;
