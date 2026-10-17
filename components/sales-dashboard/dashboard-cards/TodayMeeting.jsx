// components/sales-dashboard/dashboard-cards/TodayMeeting.jsx
"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { todayMeetingService } from "@/service/sales-dashboard/dashboard-api";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CalendarDays, X } from "lucide-react";
import Link from "next/link";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "custom", label: "Custom" },
];

const SCROLLBAR_CSS = `
  .meeting-scroll::-webkit-scrollbar { width: 6px; }
  .meeting-scroll::-webkit-scrollbar-track { background: transparent; }
  .meeting-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
  .meeting-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .meeting-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  }
`;

const TodayMeeting = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [todayMeetingData, setTodayMeetingData] = useState([]);

  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchTodayMeeting = useCallback(async () => {
    if (!employee?.user?._id) return;
    setLoading(true);
    try {
      const params = { preset };
      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }
      const res = await todayMeetingService(employee?.user?._id, params);
      if (res.success) setTodayMeetingData(res?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching meetings");
    } finally {
      setLoading(false);
    }
  }, [employee, preset, from, to]);

  useEffect(() => {
    fetchTodayMeeting();
  }, [fetchTodayMeeting]);

  const salesPersonId = employee?._id || employee?.user?._id;

  if (loading && todayMeetingData.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-3">
          <Skeleton height={64} count={3} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3eaea] p-4 rounded-lg shadow-sm border border-gray-200 lg:w-1/3 flex flex-col h-[400px]">
      <style>{SCROLLBAR_CSS}</style>

      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-lg font-bold text-gray-800">Meetings</h2>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
              preset === p.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 shrink-0">
          <div className="relative">
            <CalendarDays className="h-3.5 w-3.5 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded pl-6 pr-1 py-1 text-[11px] bg-white"
            />
          </div>
          <span className="text-[11px] text-gray-500">to</span>
          <div className="relative">
            <CalendarDays className="h-3.5 w-3.5 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded pl-6 pr-1 py-1 text-[11px] bg-white"
            />
          </div>
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="p-1 rounded hover:bg-gray-100"
              title="Clear dates"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 meeting-scroll">
        <div className="flex flex-col gap-3">
          {todayMeetingData?.length > 0 ? (
            todayMeetingData.map((meeting) => (
              <Link
                key={meeting._id}
                href={`/sales-dashboard/clients/${meeting.clientId}/${salesPersonId}`}
                className="block w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-sm truncate max-w-[180px]">
                    {meeting.clientName || "Unknown client"}
                  </h3>
                  {/* NEW: company name */}
                  {meeting.company && (
                    <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                      {meeting.company}
                    </p>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize inline-block mt-1 ${
                      meeting.updateType === "call"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {meeting.updateType || "meeting"}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(meeting.meetingAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(meeting.meetingAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <p className="text-sm">No meetings for this range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayMeeting;
