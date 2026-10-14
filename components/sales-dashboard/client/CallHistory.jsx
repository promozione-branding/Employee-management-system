// components/sales-dashboard/client/CallHistory.jsx
"use client";

import React, { useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ChevronDown,
  Play,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getRecordingLinkService } from "@/service/calling";

function formatDuration(sec = 0) {
  sec = Number(sec) || 0;
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function mapLog(log) {
  const statusMap = {
    completed: log.connected ? "Answered" : "Missed",
    answered: "Answered",
    missed: "Missed",
    failed: "Failed",
    busy: "Busy",
    initiated: "Initiated",
    ringing: "Ringing",
    cancelled: "Cancelled",
  };
  return {
    id: log._id,
    callId: log.myoperatorCallId || "",
    direction: log.direction || "outbound",
    status: statusMap[log.status] || log.status || "—",
    duration: formatDuration(log.durationSeconds),
    at: formatDate(log.startedAt),
    agent: log.agentName || log.agentEmail || "—",
    from: log.fromNumber,
    to: log.toNumber,
    note: log.note || log.disposition || "",
    recordingFile: log.recordingUrl || "",
  };
}

const CallHistory = ({ calls = [] }) => {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const rows = (calls || []).map(mapLog);

  const handlePlayRecording = async (call) => {
    // Prefer callId (myoperatorCallId) — the correct identifier for the API.
    // Fall back to recordingFile if it's already a full URL.
    const isUrl =
      call.recordingFile &&
      (call.recordingFile.startsWith("http://") ||
        call.recordingFile.startsWith("https://"));

    if (isUrl) {
      window.open(call.recordingFile, "_blank", "noopener,noreferrer");
      return;
    }

    if (!call.callId) {
      toast.error("No call ID available for this recording");
      return;
    }

    try {
      setLoadingId(call.id);
      const res = await getRecordingLinkService(call.callId);
      if (res.success && res.data?.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(res.message || "Recording link not available");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Could not load recording");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition"
      >
        <h3 className="font-semibold text-gray-800">Call History</h3>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Body */}
      {open && (
        <div>
          {!rows.length ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No call history for this client yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((call) => {
                const isInbound = call.direction === "inbound";
                const isMissed =
                  call.status === "Missed" || call.status === "Failed";
                const Icon = isMissed
                  ? PhoneMissed
                  : isInbound
                    ? PhoneIncoming
                    : PhoneOutgoing;
                const hasRecording = Boolean(
                  call.recordingFile || call.callId,
                );
                const isLoading = loadingId === call.id;

                return (
                  <li key={call.id} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) =>
                          prev === call.id ? null : call.id,
                        )
                      }
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <span
                        className={`h-9 w-9 rounded-full flex items-center justify-center ${
                          isMissed
                            ? "bg-red-50 text-red-500"
                            : isInbound
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-800">
                          {isInbound ? "Inbound" : "Outbound"} ·{" "}
                          <span
                            className={
                              isMissed ? "text-red-500" : "text-emerald-600"
                            }
                          >
                            {call.status}
                          </span>
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {call.at} · {call.duration} · {call.agent}
                        </span>
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          expanded === call.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded === call.id && (
                      <div className="mt-2 ml-12 text-xs text-gray-600 space-y-1.5">
                        <p>
                          <span className="text-gray-400">From:</span>{" "}
                          {call.from}
                        </p>
                        <p>
                          <span className="text-gray-400">To:</span> {call.to}
                        </p>
                        {call.note && (
                          <p>
                            <span className="text-gray-400">Note:</span>{" "}
                            {call.note}
                          </p>
                        )}

                        {/* Recording button */}
                        {hasRecording ? (
                          <button
                            type="button"
                            onClick={() => handlePlayRecording(call)}
                            disabled={isLoading}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition disabled:opacity-60"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Loading…
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                Play Recording
                              </>
                            )}
                          </button>
                        ) : (
                          <p className="text-xs text-gray-400 italic mt-1">
                            No recording available
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CallHistory;