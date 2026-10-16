// components/admin-dashboard/calling/CallLogs.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getAdminCallLogsService,
  getAdminAgentsService,
  getRecordingLinkService,
} from "@/service/calling";
import CallLogsFilters from "./CallLogsFilters";

const DEFAULT_FILTERS = {
  preset: "today",
  from: "",
  to: "",
  agentId: "",
  status: "",
  direction: "",
  q: "",
  page: 1,
  limit: 20,
};

function formatDuration(sec = 0) {
  sec = Number(sec) || 0;
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(log) {
  if (log.connected) return "Answered";
  const map = {
    missed: "Missed",
    failed: "Failed",
    busy: "Busy",
    cancelled: "Cancelled",
    initiated: "Initiated",
    ringing: "Ringing",
    answered: "Answered",
    completed: "Completed",
  };
  return map[log.status] || log.status || "—";
}

export default function CallLogs() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingRecording, setLoadingRecording] = useState(null);

  // Load agents once
  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminAgentsService();
        if (res.success) setAgents(res.data || []);
      } catch (err) {
        console.warn("agents load failed", err);
      }
    })();
  }, []);

  // Load logs on filters change
  const fetchLogs = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await getAdminCallLogsService(f);
      if (res.success) {
        setLogs(res.data?.logs || []);
        setPagination(res.data?.pagination || null);
        setSummary(res.summary || null);
      } else {
        toast.error(res.message || "Failed to load");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(filters);
  }, [filters, fetchLogs]);

  const handlePlayRecording = async (log) => {
    if (!log.myoperatorCallId) {
      toast.error("No recording for this call");
      return;
    }
    try {
      setLoadingRecording(log._id);
      const res = await getRecordingLinkService(log.myoperatorCallId);
      if (res.success && res.data?.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(res.message || "Recording not available");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Could not load recording");
    } finally {
      setLoadingRecording(null);
    }
  };

  const changePage = (p) => {
    setFilters((prev) => ({ ...prev, page: p }));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-3xl font-bold text-slate-900">
          Call Logs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Every call across the system — filter, review, play recordings.
        </p>
      </div>

      {/* Filters */}
      <CallLogsFilters
        filters={filters}
        setFilters={setFilters}
        agents={agents}
        onApply={(next) => setFilters(next)}
      />

      {/* Summary tiles */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SummaryTile label="Total" value={summary.totalCalls} />
          <SummaryTile
            label="Connected"
            value={summary.connectedCalls}
            tone="emerald"
          />
          <SummaryTile label="Missed" value={summary.missedCalls} tone="red" />
          <SummaryTile
            label="Talk Time"
            value={`${summary.totalTalkMinutes || 0}m`}
            tone="purple"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Date / Time</Th>
                <Th>Agent</Th>
                <Th>Customer</Th>
                <Th>Direction</Th>
                <Th>Status</Th>
                <Th>Duration</Th>
                <Th center>Recording</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton height={20} />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No calls found for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const missed =
                    !log.connected &&
                    ["missed", "failed", "busy", "cancelled"].includes(
                      log.status,
                    );
                  const isIn = log.direction === "inbound";
                  const Icon = missed
                    ? PhoneMissed
                    : isIn
                      ? PhoneIncoming
                      : PhoneOutgoing;
                  const hasRecording = Boolean(log.myoperatorCallId);
                  const recLoading = loadingRecording === log._id;

                  return (
                    <tr
                      key={log._id}
                      onClick={() => setSelected(log)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {formatDateTime(log.startedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">
                          {log.agentName || "—"}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">
                          {log.agentEmail || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-800 truncate max-w-[180px]">
                          {log.customerName || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.customerPhone || log.toNumber || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            isIn ? "text-emerald-600" : "text-blue-600"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {isIn ? "Inbound" : "Outbound"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            log.connected
                              ? "bg-emerald-50 text-emerald-700"
                              : missed
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabel(log)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {formatDuration(log.durationSeconds)}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasRecording ? (
                          <button
                            type="button"
                            onClick={() => handlePlayRecording(log)}
                            disabled={recLoading}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                          >
                            {recLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            Play
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page <b>{pagination.page}</b> of <b>{pagination.pages}</b> ·{" "}
              {pagination.total} total calls
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row details modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Call Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Row label="Agent" value={selected.agentName || "—"} />
              <Row label="Agent Email" value={selected.agentEmail || "—"} />
              <Row
                label="Customer"
                value={selected.customerName || "—"}
              />
              <Row
                label="Customer Phone"
                value={selected.customerPhone || "—"}
              />
              <Row label="Direction" value={selected.direction || "—"} />
              <Row label="Status" value={statusLabel(selected)} />
              <Row
                label="Duration"
                value={formatDuration(selected.durationSeconds)}
              />
              <Row
                label="Started"
                value={formatDateTime(selected.startedAt)}
              />
              <Row
                label="Ended"
                value={formatDateTime(selected.endedAt)}
              />
              {selected.disposition && (
                <Row label="Disposition" value={selected.disposition} />
              )}
              {selected.note && <Row label="Note" value={selected.note} />}
            </div>
            {selected.myoperatorCallId && (
              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => handlePlayRecording(selected)}
                  className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Play Recording
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, center }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function SummaryTile({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className={`rounded-lg p-3 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-medium uppercase">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium text-right break-all">
        {value}
      </span>
    </div>
  );
}
