// components/customer-history/EditHistoryView.jsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  History,
  Plus,
  Pencil,
  Trash2,
  Phone,
  LogIn,
  Download,
  Eye,
  CheckCircle2,
  ChevronDown,
  Calendar,
  User,
  PhoneCall,
  FileText,
} from "lucide-react";
import {
  getEditHistoryService,
  getEditHistoryMetaService,
} from "@/service/customer/history";
import toast from "react-hot-toast";

const ACTION_META = {
  CREATE: { icon: <Plus size={14} />, color: "bg-emerald-100 text-emerald-700" },
  UPDATE: { icon: <Pencil size={14} />, color: "bg-blue-100 text-blue-700" },
  DELETE: { icon: <Trash2 size={14} />, color: "bg-red-100 text-red-700" },
  CALL: { icon: <Phone size={14} />, color: "bg-purple-100 text-purple-700" },
  LOGIN: { icon: <LogIn size={14} />, color: "bg-gray-100 text-gray-700" },
  EXPORT: { icon: <Download size={14} />, color: "bg-orange-100 text-orange-700" },
  VIEW: { icon: <Eye size={14} />, color: "bg-gray-100 text-gray-700" },
  STATUS_CHANGE: { icon: <CheckCircle2 size={14} />, color: "bg-yellow-100 text-yellow-700" },
  ACKNOWLEDGE: { icon: <CheckCircle2 size={14} />, color: "bg-teal-100 text-teal-700" },
};

const MODULE_ICONS = {
  customer: <User size={20} className="text-blue-500" />,
  meeting: <Calendar size={20} className="text-amber-500" />,
  call: <PhoneCall size={20} className="text-purple-500" />,
  workDetail: <FileText size={20} className="text-emerald-500" />,
};

const ROLE_COLORS = {
  admin: "bg-rose-100 text-rose-700",
  manager: "bg-indigo-100 text-indigo-700",
  sales: "bg-amber-100 text-amber-700",
  employee: "bg-sky-100 text-sky-700",
  system: "bg-gray-200 text-gray-700",
};

const MODULE_LABELS = {
  proposal: "Proposal",
  proposalNew: "Proposal (new)",
  invoice: "Invoice",
  ledger: "Ledger",
  ledgerNew: "Ledger (new)",
  keyword: "SEO / Keyword",
  seoSheet: "SEO Sheet",
  meeting: "Meeting",
  call: "Call",
  attachment: "Attachment",
  customer: "Customer",
  workDetail: "Work Detail",
  teamUpdate: "Team Update",
  announcement: "Announcement",
};

const fmt = (d) => new Date(d).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit"
});

export default function EditHistoryView({ customerId }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ modules: [], roles: [], actions: [] });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({
    module: "all",
    action: "all",
    role: "all",
    q: "",
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEditHistoryService(customerId, {
        ...filters,
        page,
        limit: 30,
      });
      if (res.success) {
        setItems(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [customerId, filters, page]);

  useEffect(() => {
    getEditHistoryMetaService(customerId)
      .then((res) => res.success && setMeta(res.data))
      .catch(() => {});
  }, [customerId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
          <History size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Edit History</h1>
          <p className="text-xs text-gray-500">
            Every change made to this client — by whom, when, and what — across all modules.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 border rounded-md px-3 bg-gray-50 focus-within:bg-white transition">
          <Search size={16} className="text-gray-400" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search by summary, name, or email…"
            className="flex-1 py-2 bg-transparent outline-none text-sm"
          />
        </div>

        <select
          value={filters.module}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, module: e.target.value }));
          }}
          className="border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Modules</option>
          {meta.modules.map((m) => (
            <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
          ))}
        </select>

        <select
          value={filters.action}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, action: e.target.value }));
          }}
          className="border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Actions</option>
          {meta.actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={filters.role}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, role: e.target.value }));
          }}
          className="border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Roles</option>
          {meta.roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* TIMELINE */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">Loading history…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
          <History className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="italic">No edit history found for this client.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((row) => {
            const a = ACTION_META[row.action] || ACTION_META.VIEW;
            const isExpanded = expandedId === row._id;
            const hasChanges = row.changes && row.changes.length > 0;
            const moduleIcon = MODULE_ICONS[row.module] || <FileText size={20} className="text-gray-500" />;

            return (
              <div
                key={row._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div
                  className={`p-4 flex items-start gap-4 cursor-pointer ${hasChanges ? "hover:bg-gray-50" : ""}`}
                  onClick={() => hasChanges && setExpandedId(isExpanded ? null : row._id)}
                >
                  {/* Module Icon */}
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0 mt-1">
                    {moduleIcon}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${a.color}`}>
                        {a.icon}
                        {row.action}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {MODULE_LABELS[row.module] || row.module}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{fmt(row.createdAt)}</span>
                    </div>

                    <p className="text-sm text-gray-700 font-medium">{row.summary}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${ROLE_COLORS[row.performedByRole] || ROLE_COLORS.employee}`}>
                        {row.performedByRole}
                      </span>
                      <span className="font-medium text-gray-700">{row.performedByName}</span>
                      {row.performedByEmail && <span>({row.performedByEmail})</span>}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {hasChanges && (
                    <div className="shrink-0 mt-2 text-gray-400">
                      <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  )}
                </div>

                {/* EXPANDED CHANGES */}
                {isExpanded && hasChanges && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Field Changes</h4>
                    <div className="space-y-2">
                      {row.changes.map((change, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm bg-white p-2 rounded border border-gray-100">
                          <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                            {change.field}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-red-500 line-through decoration-red-300 bg-red-50 px-2 py-0.5 rounded break-all">
                              {JSON.stringify(change.oldValue) || "—"}
                            </span>
                            <span className="text-gray-400">➔</span>
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded break-all font-medium">
                              {JSON.stringify(change.newValue) || "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-3 rounded-lg border shadow-sm">
          <span>
            Page {pagination.page} of {pagination.pages} — {pagination.total} entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
