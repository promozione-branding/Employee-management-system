
"use client";

// components/admin-dashboard/dashboard/TodayMeeting.jsx

import { getTodayMeetingService } from "@/service/admin-dashboard/dashboard-api";
import {
  Calendar,
  Phone,
  Users,
  Video,
  CalendarDays,
  X,
  Clock,
  Building2,
  UserRound,
  CalendarCheck,
} from "lucide-react";
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
  .meeting-scroll-admin::-webkit-scrollbar {
    width: 5px;
  }

  .meeting-scroll-admin::-webkit-scrollbar-track {
    background: transparent;
  }

  .meeting-scroll-admin::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 999px;
  }

  .meeting-scroll-admin::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }

  .meeting-scroll-admin {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
`;

const formatMeetingTime = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time unavailable";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMeetingDate = (date) => {
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

const getMeetingTypeStyle = (type) => {
  switch (type?.toLowerCase()) {
    case "call":
      return {
        icon: <Phone className="h-4 w-4" />,
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        iconStyle: "bg-emerald-50 text-emerald-600",
      };

    case "meeting":
      return {
        icon: <Video className="h-4 w-4" />,
        badge: "bg-blue-50 text-blue-700 ring-blue-100",
        iconStyle: "bg-blue-50 text-blue-600",
      };

    default:
      return {
        icon: <Users className="h-4 w-4" />,
        badge: "bg-violet-50 text-violet-700 ring-violet-100",
        iconStyle: "bg-violet-50 text-violet-600",
      };
  }
};

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

      if (res.success) {
        setMeetings(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  }, [preset, from, to]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const clientBase = isManager ? "/manager/customer" : "/dashboard/customer";

  return (
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <style>{SCROLLBAR_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66]/[0.07] text-[#0A2E66]">
            <CalendarCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0A2E66] sm:text-lg">
              Meetings
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Scheduled calls and client meetings
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#F27B1E]">
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </span>
      </div>

      {/* Filters */}
      <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Filter by date
        </p>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id)}
              aria-pressed={preset === item.id}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2E66] focus-visible:ring-offset-1 ${
                preset === item.id
                  ? "border-[#0A2E66] bg-[#0A2E66] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-500">
                  From
                </span>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10"
                  />
                </div>
              </label>

              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-500">
                  To
                </span>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10"
                  />
                </div>
              </label>

              {(from || to) && (
                <button
                  type="button"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-[#F27B1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2E66]"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meeting list */}
      <div className="meeting-scroll-admin min-h-[220px] flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-slate-100 p-3"
              >
                <Skeleton
                  width={64}
                  height={64}
                  borderRadius={12}
                />

                <div className="min-w-0 flex-1 pt-1">
                  <Skeleton height={15} width="62%" />
                  <div className="mt-2">
                    <Skeleton height={12} width="40%" />
                  </div>
                  <div className="mt-2">
                    <Skeleton height={11} width="55%" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const typeStyle = getMeetingTypeStyle(meeting.updateType);

              return (
                <Link
                  key={meeting._id}
                  href={`${clientBase}/${meeting.clientId}`}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2E66] focus-visible:ring-offset-2"
                >
                  <article className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-all duration-200 group-hover:border-[#0A2E66]/20 group-hover:bg-slate-50/70 group-hover:shadow-sm sm:p-4">
                    {/* Date and time */}
                    <div className="flex w-[68px] shrink-0 flex-col items-center justify-center self-stretch rounded-xl border border-slate-100 bg-slate-50 px-1.5 py-3 text-center transition-colors group-hover:border-orange-100 group-hover:bg-orange-50/50">
                      <Clock className="mb-2 h-4 w-4 text-[#F27B1E]" />

                      <span className="text-[11px] font-bold leading-4 text-[#0A2E66] sm:text-xs">
                        {formatMeetingTime(meeting.meetingAt)}
                      </span>

                      <span className="mt-1 text-[9px] font-medium leading-3 text-slate-400">
                        {formatMeetingDate(meeting.meetingAt)}
                      </span>
                    </div>

                    {/* Meeting details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <h3 className="min-w-0 break-words text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-[#0A2E66]">
                          {meeting.clientName || "Unknown client"}
                        </h3>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeStyle.iconStyle}`}
                        >
                          {typeStyle.icon}
                        </span>
                      </div>

                      {meeting.company && (
                        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{meeting.company}</span>
                        </p>
                      )}

                      <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="shrink-0">Assigned to</span>
                        <span className="truncate font-medium text-slate-700">
                          {meeting.salesPersonName || "Unknown"}
                        </span>
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset ${typeStyle.badge}`}
                        >
                          {meeting.updateType || "Other"}
                        </span>

                        {meeting.status && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium capitalize text-slate-600 ring-1 ring-inset ring-slate-200">
                            {String(meeting.status).replace(/-/g, " ")}
                          </span>
                        )}
                      </div>

                      {meeting.note && (
                        <p className="mt-3 line-clamp-2 break-words rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                          {meeting.note}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <CalendarDays className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No meetings found
            </p>

            <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
              There are no scheduled meetings for the selected date range.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && meetings.length > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            {meetings.length}{" "}
            {meetings.length === 1 ? "appointment" : "appointments"}
          </p>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A2E66]">
            <CalendarCheck className="h-3.5 w-3.5" />
            Scheduled
          </span>
        </div>
      )}
    </section>
  );
};

export default TodayMeeting;
