// components/sales-dashboard/client/CallHistoryList.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getClientCallsService,
  getRecordingLinkService,
} from "@/service/calling";
import Loading from "@/components/layout/Loading";

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

export default function CallHistoryList({ customerId, scope = "all" }) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [loadingRecording, setLoadingRecording] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await getClientCallsService(customerId, scope);
        if (!cancelled && res.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Error while fetching calls");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (customerId) fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [customerId, scope]);

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

  if (loading) return <Loading />;

  if (!logs.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-10 text-center text-sm text-gray-500">
        No calls recorded for this client yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th>S.No</Th>
            <Th>Date / Time</Th>
            <Th>Agent</Th>
            <Th>Direction</Th>
            <Th>Status</Th>
            <Th>Duration</Th>
            <Th>Note / Disposition</Th>
            <Th center>Recording</Th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log, idx) => {
            const isIn = log.direction === "inbound";
            const missed =
              !log.connected &&
              ["missed", "failed", "busy", "cancelled"].includes(log.status);
            const Icon = missed
              ? PhoneMissed
              : isIn
                ? PhoneIncoming
                : PhoneOutgoing;
            const recLoading = loadingRecording === log._id;

            return (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {formatDate(log.startedAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-800">
                    {log.agentName || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.agentEmail || ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isIn ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {isIn ? "Inbound" : "Outbound"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      log.connected
                        ? "bg-emerald-50 text-emerald-700"
                        : missed
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabel(log)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDuration(log.durationSeconds)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {log.note || log.disposition || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {log.myoperatorCallId ? (
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
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, center }) {
  return (
    <th
      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
