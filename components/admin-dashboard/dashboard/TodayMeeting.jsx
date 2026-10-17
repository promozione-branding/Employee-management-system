// components/admin-dashboard/dashboard/TodayMeeting.jsx
"use client";

import { getTodayMeetingService } from "@/service/admin-dashboard/dashboard-api";
import { Calendar, Phone, Users, Video, CalendarDays, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "custom", label: "Custom" },
];

const SCROLLBAR_CSS = `
  .meeting-scroll-admin::-webkit-scrollbar { width: 6px; }
  .meeting-scroll-admin::-webkit-scrollbar-track { background: transparent; }
  .meeting-scroll-admin::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
  .meeting-scroll-admin::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .meeting-scroll-admin {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  }
`;

const TodayMeeting = () => {
  const pathname = usePathname();
  const isManager = pathname?.startsWith("/manager");

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { preset };
      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }
      const res = await getTodayMeetingService(params);
      if (res.success) setMeetings(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [preset, from, to]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "call":
        return <Phone size={16} className="text-green-600" />;
      case "meeting":
        return <Video size={16} className="text-blue-600" />;
      default:
        return <Users size={16} className="text-purple-600" />;
    }
  };

  const clientBase = isManager ? "/manager/customer" : "/dashboard/customer";

  return (
    <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 border h-full lg:w-full flex flex-col">
      <style>{SCROLLBAR_CSS}</style>

      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="bg-purple-50 p-2 rounded-lg">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Meetings</h2>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded border transition ${
              preset === p.id
                ? "bg-purple-600 text-white border-purple-600"
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

      <div className="flex-1 min-h-0 overflow-y-auto meeting-scroll-admin -mx-2 px-2">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 border-b pb-4 last:border-0">
                <Skeleton width={60} height={60} className="rounded-lg" />
                <div className="flex-1">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} className="mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <Link
                key={meeting._id}
                href={`${clientBase}/${meeting.clientId}`}
                className="block text-left"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-white hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center bg-slate-100 min-w-[60px] h-[60px] rounded-lg p-2 text-center shrink-0">
                    <span className="text-xs font-bold text-slate-600">
                      {new Date(meeting.meetingAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {meeting.clientName || "Unknown"}
                      </h3>
                      <span className="bg-slate-100 p-1.5 rounded-full shrink-0">
                        {getIcon(meeting.updateType)}
                      </span>
                    </div>

                    {/* NEW: company name */}
                    <p className="text-xs text-slate-500 truncate">
                      {meeting.company || ""}
                    </p>

                    <p className="text-[11px] text-slate-600 truncate mt-1">
                      <span className="text-slate-400">by</span>{" "}
                      <b>{meeting.salesPersonName || "Unknown"}</b>
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          meeting.updateType === "call"
                            ? "bg-green-100 text-green-700"
                            : meeting.updateType === "meeting"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {meeting.updateType}
                      </span>
                      {meeting.status && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600 border border-gray-200">
                          {String(meeting.status).replace(/-/g, " ")}
                        </span>
                      )}
                    </div>
                    {meeting.note && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                        {meeting.note}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            No meetings in this range.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayMeeting;
