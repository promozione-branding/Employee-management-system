"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { todayMeetingService } from "@/service/sales-dashboard/dashboard-api";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CalendarDays, X, Clock3, UsersRound } from "lucide-react";
import Link from "next/link";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "custom", label: "Custom" },
];

const SCROLLBAR_CSS = `
  .meeting-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .meeting-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .meeting-scroll::-webkit-scrollbar-thumb {
    background: #D5DCE8;
    border-radius: 10px;
  }

  .meeting-scroll::-webkit-scrollbar-thumb:hover {
    background: #A5B1C5;
  }

  .meeting-scroll {
    scrollbar-width: thin;
    scrollbar-color: #D5DCE8 transparent;
  }
`;

const TodayMeeting = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [todayMeetingData, setTodayMeetingData] = useState([]);
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const salesPersonId = employee?._id || employee?.user?._id;

  const fetchTodayMeeting = useCallback(async () => {
    if (!employee?.user?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = { preset };

      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }

      const res = await todayMeetingService(employee.user._id, params);

      if (res.success) {
        setTodayMeetingData(res?.data || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching meetings");
    } finally {
      setLoading(false);
    }
  }, [employee, preset, from, to]);

  useEffect(() => {
    fetchTodayMeeting();
  }, [fetchTodayMeeting]);

  const formatTime = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Time unavailable";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      <style>{SCROLLBAR_CSS}</style>

      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: NAVY }}
        >
          <CalendarDays size={21} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
            Meetings
          </h2>

          <p className="mt-0.5 text-xs text-[#8A92A6]">Your meeting schedule</p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
          <Clock3 size={15} />
        </span>
      </div>

      {/* Date filters */}
      <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
        {PRESETS.map((item) => {
          const isActive = preset === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "border-[#0A2E66] bg-[#0A2E66] text-white shadow-sm"
                  : "border-[#E3E7F0] bg-white text-[#596579] hover:border-[#F27B1E] hover:text-[#0A2E66]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Custom date range */}
      {preset === "custom" && (
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
          <input
            aria-label="From date"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="min-w-0 max-w-full rounded-lg border border-[#E3E7F0] bg-white px-2 py-1.5 text-xs text-[#26344D] outline-none focus:border-[#0A2E66]"
          />

          <span className="text-xs text-[#8A92A6]">to</span>

          <input
            aria-label="To date"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="min-w-0 max-w-full rounded-lg border border-[#E3E7F0] bg-white px-2 py-1.5 text-xs text-[#26344D] outline-none focus:border-[#0A2E66]"
          />

          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="rounded-lg p-1.5 text-[#8A92A6] transition hover:bg-[#F4F6F9] hover:text-[#0A2E66]"
              title="Clear dates"
              aria-label="Clear date range"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* Meetings list */}
      <div className="meeting-scroll min-h-0 flex-1 overflow-y-auto pr-1">
        {loading && todayMeetingData.length === 0 ? (
          <div className="space-y-3 pt-1">
            <Skeleton
              height={86}
              count={3}
              borderRadius={12}
              baseColor="#F0F3F8"
              highlightColor="#FAFBFD"
            />
          </div>
        ) : todayMeetingData.length > 0 ? (
          <div className="flex flex-col gap-3">
            {todayMeetingData.map((meeting) => (
              <Link
                key={meeting._id}
                href={`/sales-dashboard/clients/${meeting.clientId}/${salesPersonId}`}
                className="group flex min-w-0 items-start justify-between gap-3 rounded-xl border border-[#E9EDF4] bg-[#FAFBFD] p-3 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-white hover:shadow-[0_4px_14px_rgba(15,27,51,0.05)]"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#26344D] transition-colors group-hover:text-[#0A2E66]">
                    {meeting.clientName || "Unknown client"}
                  </h3>

                  {meeting.company && (
                    <p className="mt-1 truncate text-xs text-[#8A92A6]">
                      {meeting.company}
                    </p>
                  )}

                  <span
                    className={`mt-2 inline-flex max-w-full rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${
                      meeting.updateType === "call"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-orange-50 text-[#C56816]"
                    }`}
                  >
                    {meeting.updateType || "meeting"}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-[#26344D]">
                    {formatTime(meeting.meetingAt)}
                  </p>

                  <p className="mt-1 text-[11px] text-[#929BAD]">
                    {formatDate(meeting.meetingAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <UsersRound size={20} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No meetings found
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#929BAD]">
              There are no meetings for this date range.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex shrink-0 items-center justify-between border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Meeting overview
        </span>

        <span className="rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {todayMeetingData.length} Meetings
        </span>
      </div>
    </div>
  );
};

export default TodayMeeting;
