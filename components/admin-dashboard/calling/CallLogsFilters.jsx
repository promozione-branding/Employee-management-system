// components/admin-dashboard/calling/CallLogsFilters.jsx
"use client";

import React from "react";
import { Search } from "lucide-react";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "custom", label: "Custom" },
];

export default function CallLogsFilters({
  filters,
  setFilters,
  agents = [],
  onApply,
}) {
  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5 space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase mr-1">
          Range
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              update({ preset: p.id, page: 1 });
              onApply?.({ ...filters, preset: p.id, page: 1 });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
              filters.preset === p.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date row */}
      {filters.preset === "custom" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={filters.from || ""}
              onChange={(e) => update({ from: e.target.value, page: 1 })}
              className="border border-slate-200 rounded-md px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={filters.to || ""}
              onChange={(e) => update({ to: e.target.value, page: 1 })}
              className="border border-slate-200 rounded-md px-2 py-1 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => onApply?.({ ...filters, page: 1 })}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      )}

      {/* Row: agent, status, direction, search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Agent */}
        <select
          value={filters.agentId || ""}
          onChange={(e) => {
            update({ agentId: e.target.value, page: 1 });
            onApply?.({ ...filters, agentId: e.target.value, page: 1 });
          }}
          className="border border-slate-200 rounded-md px-2 py-2 text-sm bg-white"
        >
          <option value="">All Agents</option>
          {agents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || ""}
          onChange={(e) => {
            update({ status: e.target.value, page: 1 });
            onApply?.({ ...filters, status: e.target.value, page: 1 });
          }}
          className="border border-slate-200 rounded-md px-2 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="connected">Connected</option>
          <option value="missed">Missed / Failed</option>
          <option value="failed">Failed only</option>
        </select>

        {/* Direction */}
        <select
          value={filters.direction || ""}
          onChange={(e) => {
            update({ direction: e.target.value, page: 1 });
            onApply?.({ ...filters, direction: e.target.value, page: 1 });
          }}
          className="border border-slate-200 rounded-md px-2 py-2 text-sm bg-white"
        >
          <option value="">All Directions</option>
          <option value="outbound">Outbound</option>
          <option value="inbound">Inbound</option>
        </select>

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or phone…"
            value={filters.q || ""}
            onChange={(e) => update({ q: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onApply?.({ ...filters, page: 1 });
              }
            }}
            className="w-full border border-slate-200 rounded-md pl-8 pr-2 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
