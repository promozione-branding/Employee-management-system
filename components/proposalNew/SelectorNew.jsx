// components/proposalNew/SelectorNew.jsx

"use client";
import React, { useMemo, useState } from "react";
import { PROPOSAL_CATALOG } from "@/config/new/proposalCatalogNew";
import { Check, Plus, X, ChevronDown } from "lucide-react";

const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const SelectorNew = ({
  selectedItems = [],
  onChange,
  checklist = [],
  onChecklistChange,
}) => {
  const categories = useMemo(() => Object.values(PROPOSAL_CATALOG), []);
  const [openCategory, setOpenCategory] = useState(categories[0]?.key || null);

  const isSelected = (catKey, pkgKey, durKey) =>
    selectedItems.some(
      (it) =>
        it.category === catKey &&
        it.packageKey === pkgKey &&
        it.duration === durKey
    );

  const addItem = (
    category,
    pkg,
    durationKey,
    durationLabel,
    amountOverride
  ) => {
    const amount = amountOverride ?? pkg?.prices?.[durationKey] ?? 0;
    if (amount <= 0) return;
    if (isSelected(category.key, pkg.key, durationKey)) return;

    onChange([
      ...selectedItems,
      {
        category: category.key,
        categoryLabel: category.label,
        packageKey: pkg.key,
        label: pkg.label,
        duration: durationKey,
        durationLabel,
        amount: Number(amount),
        custom: !!pkg.custom,
      },
    ]);
  };

  const removeItem = (index) => {
    const it = selectedItems[index];
    onChange(selectedItems.filter((_, i) => i !== index));

    // If no more items for that category, remove its checklist
    if (it && onChecklistChange) {
      const stillHasCategory = selectedItems.some(
        (s, i) => i !== index && s.category === it.category
      );
      if (!stillHasCategory) {
        const cat = PROPOSAL_CATALOG[it.category];
        const catSections = cat?.checklist?.map((s) => s.title) || [];
        onChecklistChange(
          checklist.filter((c) => !catSections.includes(c.section))
        );
      }
    }
  };

  const clearAll = () => {
    onChange([]);
    if (onChecklistChange) onChecklistChange([]);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {categories.map((cat) => {
        const isOpen = openCategory === cat.key;
        const hasSelected = selectedItems.some((it) => it.category === cat.key);

        return (
          <div
            key={cat.key}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenCategory(isOpen ? null : cat.key)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{cat.label}</h3>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
                {hasSelected && (
                  <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <Plus
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>

            {isOpen && (
              <>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.packages.map((pkg) => (
                    <PackageCard
                      key={pkg.key}
                      category={cat}
                      pkg={pkg}
                      selectedItems={selectedItems}
                      onAdd={addItem}
                      isSelected={isSelected}
                    />
                  ))}
                </div>

                {/* CHECKLIST INLINE — shows when at least one package picked */}
                {hasSelected && cat.checklist?.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                      {cat.label} — Deliverables Checklist
                    </p>

                    {cat.checklist.map((section) => (
                      <ChecklistSection
                        key={section.title}
                        section={section}
                        checklist={checklist}
                        onChange={onChecklistChange}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {selectedItems.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-emerald-900">
              Selected ({selectedItems.length})
            </h3>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-emerald-700 hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {selectedItems.map((it, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-100"
              >
                <div className="text-sm">
                  <span className="font-medium text-gray-800">{it.label}</span>
                  <span className="text-gray-500">
                    {" "}
                    · {it.categoryLabel}
                    {it.durationLabel ? ` · ${it.durationLabel}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {fmt(it.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ChecklistSection = ({ section, checklist, onChange }) => {
  const [open, setOpen] = useState(false);

  const sel = checklist.find((c) => c.section === section.title);
  const count = sel ? sel.items.length : 0;
  const total = section.items.length;
  const all = count === total;

  const isTicked = (item) => sel?.items?.includes(item) || false;

  const toggleItem = (item) => {
    const existing = checklist.find((c) => c.section === section.title);
    let next;
    if (!existing) {
      next = [...checklist, { section: section.title, items: [item] }];
    } else if (existing.items.includes(item)) {
      const filtered = existing.items.filter((i) => i !== item);
      next = filtered.length
        ? checklist.map((c) =>
            c.section === section.title ? { ...c, items: filtered } : c
          )
        : checklist.filter((c) => c.section !== section.title);
    } else {
      next = checklist.map((c) =>
        c.section === section.title
          ? { ...c, items: [...c.items, item] }
          : c
      );
    }
    onChange(next);
  };

  const toggleAll = () => {
    const existing = checklist.find((c) => c.section === section.title);
    let next;
    if (all) {
      next = checklist.filter((c) => c.section !== section.title);
    } else {
      const merged = existing
        ? [...new Set([...existing.items, ...section.items])]
        : section.items;
      next = [
        ...checklist.filter((c) => c.section !== section.title),
        { section: section.title, items: merged },
      ];
    }
    onChange(next);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-2">
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
          <span className="text-sm font-medium text-gray-800">
            {section.title}
          </span>
          <span className="text-xs text-gray-500">
            ({count}/{total})
          </span>
        </button>

        <button
          type="button"
          onClick={toggleAll}
          className={`text-xs px-2 py-1 rounded-md border ${
            all
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          {all ? "Untick all" : "Tick all"}
        </button>
      </div>

      {open && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {section.items.map((item) => {
            const ticked = isTicked(item);
            return (
              <label
                key={item}
                className={`flex items-start gap-2 text-sm rounded-md px-2 py-1.5 cursor-pointer ${
                  ticked
                    ? "bg-emerald-50 text-emerald-900"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={ticked}
                  onChange={() => toggleItem(item)}
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PackageCard = ({ category, pkg, selectedItems, onAdd, isSelected }) => {
  const [durationKey, setDurationKey] = useState(category.durations[0]?.key);
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const effectiveDurationKey = useCustomDuration
    ? `custom::${customDuration.trim() || "N/A"}`
    : durationKey;

  const effectiveDurationLabel = useCustomDuration
    ? customDuration.trim() || "Custom"
    : category.durations.find((d) => d.key === durationKey)?.label ||
      durationKey;

  const price = pkg.custom
    ? Number(customAmount || 0)
    : useCustomDuration
    ? Number(customAmount || 0)
    : pkg.prices?.[durationKey] || 0;

  const selected = isSelected(category.key, pkg.key, effectiveDurationKey);

  const canAdd =
    !selected &&
    price > 0 &&
    (!useCustomDuration || customDuration.trim().length > 0);

  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-2 transition ${
        selected
          ? "border-emerald-400 bg-emerald-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="font-medium text-gray-800 text-sm">{pkg.label}</p>
        {selected && (
          <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="flex gap-1 flex-wrap">
        {category.durations.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => {
              setDurationKey(d.key);
              setUseCustomDuration(false);
            }}
            className={`text-xs px-2 py-1 rounded-md border ${
              !useCustomDuration && durationKey === d.key
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {d.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setUseCustomDuration(true)}
          className={`text-xs px-2 py-1 rounded-md border ${
            useCustomDuration
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          Custom
        </button>
      </div>

      {useCustomDuration && (
        <input
          type="text"
          value={customDuration}
          onChange={(e) => setCustomDuration(e.target.value)}
          placeholder="e.g. 4 Months"
          className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      )}

      {pkg.custom ? (
        <input
          type="number"
          min="0"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      ) : useCustomDuration ? (
        <input
          type="number"
          min="0"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      ) : (
        <p className="text-lg font-semibold text-gray-900">{fmt(price)}</p>
      )}

      <button
        type="button"
        disabled={!canAdd}
        onClick={() =>
          onAdd(
            category,
            pkg,
            effectiveDurationKey,
            effectiveDurationLabel,
            price
          )
        }
        className={`mt-1 text-xs font-medium rounded-md py-1.5 transition ${
          selected
            ? "bg-emerald-100 text-emerald-700 cursor-default"
            : !canAdd
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {selected ? "Added" : "Add"}
      </button>
    </div>
  );
};

export default SelectorNew;
