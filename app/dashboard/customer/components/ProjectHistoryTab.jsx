// app/dashboard/customer/components/ProjectHistoryTab.jsx

"use client";

import React, { useMemo, useState } from "react";
import {
  Clock3,
  Eye,
  FileText,
  Pencil,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";

const TENURE_OPTIONS = [
  { value: "3m", label: "3 Months", months: 3 },
  { value: "6m", label: "6 Months", months: 6 },
  { value: "12m", label: "12 Months", months: 12 },
  { value: "custom", label: "Custom", months: null },
];

const smallInputClassName =
  "w-full rounded-md border border-[#DCE3EE] bg-white px-2 py-1 text-[11px] text-[#24334D] outline-none focus:border-[#4779C5]";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const addMonthsToDate = (dateString, months) => {
  if (!dateString || !months) return "";
  const [y, m, d] = dateString.split("-").map(Number);
  const tIndex = m - 1 + months;
  const tYear = y + Math.floor(tIndex / 12);
  const tMonth = tIndex % 12;
  const lastDay = new Date(tYear, tMonth + 1, 0).getDate();
  const tDay = Math.min(d, lastDay);
  const r = new Date(tYear, tMonth, tDay);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, "0")}-${String(
    r.getDate(),
  ).padStart(2, "0")}`;
};

// Newest first: startDate desc → createdAt desc → _id desc (ObjectId ≈ timestamp)
const sortNewestFirst = (list = []) => {
  return [...list].sort((a, b) => {
    const sa = a?.startDate ? new Date(a.startDate).getTime() : -Infinity;
    const sb = b?.startDate ? new Date(b.startDate).getTime() : -Infinity;
    if (sa !== sb) return sb - sa;
    const ca = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const cb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (ca !== cb) return cb - ca;
    return String(b?._id || "").localeCompare(String(a?._id || ""));
  });
};

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#E9EDF4] px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF3FC] text-[#315F9F]">
          <Clock3 size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#18365F]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-snug text-[#8792A5]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function ProjectLiveCard({
  item,
  onEdit,
  onDelete,
  isDeleting,
  onViewProposal,
  onSaveStatus,
}) {
  const isLive = item?.status === "live";
  const hasProposal = Boolean(item?.proposalId);

  const [startDate, setStartDate] = useState(
    toInputDate(item?.activatedAt) || getToday(),
  );
  const [tenure, setTenure] = useState(item?.renewalDuration || "3m");
  const [customEnd, setCustomEnd] = useState(
    toInputDate(item?.renewalEndDate) || "",
  );
  const [saving, setSaving] = useState(false);

  const computedEnd = useMemo(() => {
    if (!startDate) return "";
    if (tenure === "custom") return customEnd;
    const opt = TENURE_OPTIONS.find((o) => o.value === tenure);
    if (!opt?.months) return "";
    return addMonthsToDate(startDate, opt.months);
  }, [startDate, tenure, customEnd]);

  const persist = async (nextStatus) => {
    setSaving(true);
    try {
      await onSaveStatus({
        item,
        nextStatus,
        startDate,
        tenure,
        computedEnd,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-lg border border-[#E3E8F0] bg-white p-2.5 transition hover:border-[#C8D6EA] hover:shadow-sm">
      {/* Header row — compact */}
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EEF3FC] text-[#4779C5]">
          <FileText size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-bold text-[#263B5B]">
            {item?.projectName || "Untitled Project"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="rounded bg-[#F0F4FA] px-1.5 py-0.5 text-[10px] font-semibold capitalize text-[#4E607B]">
              {item?.categoryLabel || item?.service || "Service"}
            </span>
            {item?.proposalNumber && (
              <span className="rounded bg-[#EEF7EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#2F7A44]">
                {item.proposalNumber}
              </span>
            )}
            {isLive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EF] px-1.5 py-0.5 text-[9px] font-bold text-[#27834E]">
                <span className="h-1 w-1 rounded-full bg-[#27834E]" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F9] px-1.5 py-0.5 text-[9px] font-bold text-[#718097]">
                IN BUILD
              </span>
            )}
          </div>
        </div>

        {hasProposal && (
          <button
            type="button"
            onClick={() => onViewProposal(item.proposalId)}
            title="View proposal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#D8E5F8] bg-[#F1F6FF] text-[#3569B4] hover:bg-[#E1ECFF]"
          >
            <Eye size={13} />
          </button>
        )}
      </div>

      {/* Two timelines — single tight row */}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded-md border border-[#E6ECF5] bg-[#F7F9FC] px-2 py-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8190A6]">
            Build
          </p>
          <p className="mt-0.5 text-[11px] text-[#34445F]">
            <span className="text-[#929DB0]">S </span>
            {formatDate(item?.startDate)}
          </p>
          <p className="text-[11px] text-[#34445F]">
            <span className="text-[#929DB0]">E </span>
            {formatDate(item?.endDate)}
          </p>
        </div>

        <div
          className={`rounded-md border px-2 py-1.5 ${
            isLive
              ? "border-[#CBEBD6] bg-[#F1FBF4]"
              : "border-[#E6ECF5] bg-[#F7F9FC]"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8190A6]">
            Renewal (mailer)
          </p>
          <p className="mt-0.5 text-[11px] text-[#34445F]">
            <span className="text-[#929DB0]">S </span>
            {item?.activatedAt ? formatDate(item.activatedAt) : "Not active"}
          </p>
          <p className="text-[11px] text-[#34445F]">
            <span className="text-[#929DB0]">E </span>
            {item?.renewalEndDate
              ? formatDate(item.renewalEndDate)
              : "Not active"}
          </p>
        </div>
      </div>

      {/* Renewal setup — compact */}
      <div className="mt-2 rounded-md border border-[#EEF1F6] bg-[#FAFBFD] p-2">
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-wide text-[#8190A6]">
              Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${smallInputClassName} mt-0.5`}
            />
          </div>
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-wide text-[#8190A6]">
              Tenure
            </label>
            <select
              value={tenure}
              onChange={(e) => {
                setTenure(e.target.value);
                if (e.target.value !== "custom") setCustomEnd("");
              }}
              className={`${smallInputClassName} mt-0.5`}
            >
              {TENURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-wide text-[#8190A6]">
              End
            </label>
            {tenure === "custom" ? (
              <input
                type="date"
                value={customEnd}
                min={startDate || undefined}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={`${smallInputClassName} mt-0.5`}
              />
            ) : (
              <input
                type="text"
                readOnly
                value={computedEnd ? formatDate(computedEnd) : "—"}
                className={`${smallInputClassName} mt-0.5 bg-gray-50 font-medium text-[#34445F]`}
              />
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F6] pt-2">
          <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#34445F]">
            <input
              type="checkbox"
              checked={isLive}
              disabled={saving}
              onChange={(e) => persist(e.target.checked ? "live" : "in_build")}
              className="h-3.5 w-3.5 accent-[#27834E]"
            />
            Project is Live
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => persist("live")}
              disabled={saving}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-white transition disabled:opacity-60 ${
                isLive
                  ? "bg-[#27834E] hover:bg-[#1F6B3E]"
                  : "bg-[#183F75] hover:bg-[#12315C]"
              }`}
            >
              {saving ? (
                <RefreshCw size={11} className="animate-spin" />
              ) : (
                <Send size={11} />
              )}
              {isLive ? "Save renewal" : "Save & Go Live"}
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D8E5F8] bg-[#F1F6FF] text-[#3569B4] hover:bg-[#E1ECFF]"
              aria-label="Edit"
            >
              <Pencil size={12} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item?._id)}
              disabled={isDeleting}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#F5DAD8] bg-[#FFF3F2] text-[#D45149] hover:bg-[#FFE5E3] disabled:opacity-50"
              aria-label="Delete"
            >
              {isDeleting ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProposalViewModal({ open, proposal, loading, onClose }) {
  if (!open) return null;
  const items = Array.isArray(proposal?.items) ? proposal.items : [];
  const proposalNumber =
    proposal?.proposalNumber ||
    proposal?.quotationNumber ||
    proposal?._id ||
    "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E9EDF4] px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#18365F]">
              Proposal {proposalNumber || ""}
            </h3>
            <p className="mt-0.5 text-xs text-[#8792A5]">
              {items.length} service item(s)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E8F0] text-[#718097] hover:bg-[#F2F4F9]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-[#718097]">
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Loading proposal...
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8792A5]">
              No items found on this proposal.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const label =
                  item.categoryLabel || item.label || item.category || "—";
                return (
                  <div
                    key={item._id || idx}
                    className="rounded-lg border border-[#E3E8F0] bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#263B5B]">
                        {label}
                      </p>
                      {item.category && (
                        <span className="rounded-md bg-[#F0F4FA] px-2 py-1 text-[11px] font-semibold text-[#4E607B]">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {(item.startDate || item.endDate || item.duration) && (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[#60708A]">
                        <div>
                          <span className="text-[#929DB0]">Start: </span>
                          {item.startDate ? formatDate(item.startDate) : "—"}
                        </div>
                        <div>
                          <span className="text-[#929DB0]">End: </span>
                          {item.endDate ? formatDate(item.endDate) : "—"}
                        </div>
                        <div>
                          <span className="text-[#929DB0]">Duration: </span>
                          {item.duration || "—"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectHistoryTab({
  projects = [],
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onViewProposal,
  deletingId,
  onSaveStatus,
}) {
  // Newest first — overrides whatever order the parent passes in
  const ordered = useMemo(() => sortNewestFirst(projects), [projects]);

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E3E8F0] bg-white shadow-sm">
      <SectionHeader
        title="Project & Service History"
        subtitle="Newest first — two timelines per project."
        action={
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E3E8F0] text-[#718097] transition hover:bg-[#F2F4F9] disabled:opacity-50"
            aria-label="Refresh project history"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      <div className="flex items-center justify-between gap-2 border-b border-[#EEF1F6] bg-[#FAFBFD] px-3 py-1.5 sm:px-4">
        <span className="text-[11px] font-medium text-[#78869C]">
          Total projects
        </span>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#E8EFFB] px-1.5 py-0.5 text-[11px] font-bold text-[#315F9F]">
          {ordered.length}
        </span>
      </div>

      <div className="max-h-[700px] min-h-[200px] space-y-2 overflow-y-auto p-2 sm:p-2.5">
        {loading ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center">
            <RefreshCw size={18} className="animate-spin text-[#4779C5]" />
            <p className="text-xs font-medium text-[#718097]">
              Loading project history...
            </p>
          </div>
        ) : ordered.length > 0 ? (
          ordered.map((item) => (
            <ProjectLiveCard
              key={item?._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingId === item?._id}
              onViewProposal={onViewProposal}
              onSaveStatus={onSaveStatus}
            />
          ))
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5FB] text-[#8293AE]">
              <FileText size={22} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#34445F]">
              No project history yet
            </h3>
            <p className="mt-1 max-w-[230px] text-[11px] leading-relaxed text-[#8B97AA]">
              Add a project and map it to a proposal to see it here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Re-export modal so parent can render it if needed
export { ProposalViewModal };
