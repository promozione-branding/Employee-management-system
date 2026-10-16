// components/proposalNew/ChecklistNew.jsx

"use client";
import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PROPOSAL_CATALOG } from "@/config/new/proposalCatalogNew";

const ChecklistNew = ({ items = [], checklist = [], onChange }) => {
  const [closed, setClosed] = useState({});

  const activeCategories = useMemo(() => {
    const keys = [...new Set(items.map((it) => it.category))];
    return keys
      .map((k) => PROPOSAL_CATALOG[k])
      .filter((c) => c && Array.isArray(c.checklist) && c.checklist.length);
  }, [items]);

  if (!activeCategories.length) return null;

  const isTicked = (section, item) => {
    const s = checklist.find((c) => c.section === section);
    return s ? s.items.includes(item) : false;
  };

  const toggleItem = (section, item) => {
    const existing = checklist.find((c) => c.section === section);
    let next;
    if (!existing) {
      next = [...checklist, { section, items: [item] }];
    } else if (existing.items.includes(item)) {
      const filtered = existing.items.filter((i) => i !== item);
      next = filtered.length
        ? checklist.map((c) =>
            c.section === section ? { ...c, items: filtered } : c
          )
        : checklist.filter((c) => c.section !== section);
    } else {
      next = checklist.map((c) =>
        c.section === section ? { ...c, items: [...c.items, item] } : c
      );
    }
    onChange(next);
  };

  const toggleAll = (section, sectionItems) => {
    const existing = checklist.find((c) => c.section === section);
    const allTicked = existing && existing.items.length === sectionItems.length;
    let next;
    if (allTicked) {
      next = checklist.filter((c) => c.section !== section);
    } else {
      const merged = existing
        ? [...new Set([...existing.items, ...sectionItems])]
        : sectionItems;
      next = [
        ...checklist.filter((c) => c.section !== section),
        { section, items: merged },
      ];
    }
    onChange(next);
  };

  const isOpen = (s) => closed[s] !== true;
  const toggleOpen = (s) => setClosed((p) => ({ ...p, [s]: !isOpen(s) }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Deliverables Checklist</h3>
        <p className="text-xs text-gray-500">
          Tick the deliverables included in this proposal
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {activeCategories.map((cat) => (
          <div key={cat.key} className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {cat.label} — Deliverables
            </p>

            {cat.checklist.map((section) => {
              const sel = checklist.find((c) => c.section === section.title);
              const count = sel ? sel.items.length : 0;
              const open = isOpen(section.title);
              const all = count === section.items.length;

              return (
                <div
                  key={section.title}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleOpen(section.title)}
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
                        ({count}/{section.items.length})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAll(section.title, section.items)}
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
                        const ticked = isTicked(section.title, item);
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
                              onChange={() => toggleItem(section.title, item)}
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
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistNew;
