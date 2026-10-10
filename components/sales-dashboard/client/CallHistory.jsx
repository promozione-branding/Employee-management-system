// components/sales-dashboard/client/CallHistory.jsx
"use client";

import React, { useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ChevronDown,
} from "lucide-react";

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
    direction: log.direction || "outbound",
    status: statusMap[log.status] || log.status || "—",
    duration: formatDuration(log.durationSeconds),
    at: formatDate(log.startedAt),
    agent: log.agentName || log.agentEmail || "—",
    from: log.fromNumber,
    to: log.toNumber,
    note: log.note || log.disposition || "",
  };
}

const CallHistory = ({ calls = [] }) => {
  // panel open/close
  const [open, setOpen] = useState(true);
  // which row is expanded
  const [expanded, setExpanded] = useState(null);

  const rows = (calls || []).map(mapLog);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* ✅ Header with arrow */}
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

      {/* ✅ Collapsible body */}
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

                return (
                  <li key={call.id} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) =>
                          prev === call.id ? null : call.id
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

                      {/* per-row chevron */}
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          expanded === call.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded === call.id && (
                      <div className="mt-2 ml-12 text-xs text-gray-600 space-y-1">
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