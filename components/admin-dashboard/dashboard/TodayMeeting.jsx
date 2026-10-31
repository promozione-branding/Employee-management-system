
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
  ChevronRight,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ========================================
// DATE FILTERS
// ========================================

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "custom", label: "Custom" },
];

// ========================================
// COLORS
// ========================================

const COLORS = {
  navy: "#0A2E66",
  navyLight: "#12397A",
  blue: "#376BB5",
  blueBg: "#E9EFF9",
  orange: "#F27B1E",
  orangeBg: "#FFF3D9",
  green: "#16865D",
  greenBg: "#E5F5EC",
  purple: "#7050E8",
  purpleBg: "#EDE9FC",
  text: "#0F1B33",
  muted: "#56647D",
  subtle: "#8793AA",
  border: "#E1E7F0",
  background: "#F7F8FC",
};

// ========================================
// SCROLLBAR
// ========================================

const SCROLLBAR_CSS = `
  .meeting-scroll-admin::-webkit-scrollbar {
    width: 5px;
  }

  .meeting-scroll-admin::-webkit-scrollbar-track {
    background: transparent;
  }

  .meeting-scroll-admin::-webkit-scrollbar-thumb {
    background-color: #DDE4EF;
    border-radius: 999px;
  }

  .meeting-scroll-admin::-webkit-scrollbar-thumb:hover {
    background-color: #AEBBD0;
  }

  .meeting-scroll-admin {
    scrollbar-width: thin;
    scrollbar-color: #DDE4EF transparent;
  }
`;

// ========================================
// DATE FORMATTERS
// ========================================

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

// ========================================
// MEETING TYPE STYLES
// ========================================

const getMeetingTypeStyle = (type) => {
  switch (type?.toLowerCase()) {
    case "call":
      return {
        icon: Phone,
        label: "Call",
        color: COLORS.green,
        background: COLORS.greenBg,
        border: "#C6EAD6",
      };

    case "meeting":
      return {
        icon: Video,
        label: "Meeting",
        color: COLORS.blue,
        background: COLORS.blueBg,
        border: "#D5E1F4",
      };

    default:
      return {
        icon: Users,
        label: type || "Other",
        color: COLORS.purple,
        background: COLORS.purpleBg,
        border: "#E1DAFA",
      };
  }
};

// ========================================
// MAIN COMPONENT
// ========================================

const TodayMeeting = () => {
  const pathname = usePathname();

  const isManager = pathname?.startsWith("/manager");

  const clientBase = isManager
    ? "/manager/customer"
    : "/dashboard/customer";

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ========================================
  // FETCH MEETINGS
  // ========================================

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

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      className="
        flex
        h-[410px]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
        transition-shadow
        duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:p-[22px]
      "
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          {/* Header icon */}

          <div
            className="
              flex
              h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#E9EFF9]
              text-[#376BB5]
            "
          >
            <CalendarCheck size={20} strokeWidth={1.9} />
          </div>

          {/* Heading */}

          <div className="min-w-0">

            <h2
              className="
                font-serif
                text-[21px]
                font-bold
                leading-tight
                tracking-tight
                text-[#0A2E66]
              "
            >
              Meetings
            </h2>

            <p className="mt-1 text-[13px] leading-5 text-[#56647D]">
              Scheduled calls and client meetings
            </p>

          </div>

        </div>

        {/* Meeting count */}

        <span
          className="
            inline-flex
            h-[29px]
            shrink-0
            items-center
            gap-1.5
            rounded-full
            bg-[#E9EFF9]
            px-3
            text-[11px]
            font-bold
            text-[#376BB5]
          "
        >
          <Calendar size={13} />

          {meetings.length} Meetings
        </span>

      </div>

      {/* ================================== */}
      {/* DATE FILTERS */}
      {/* ================================== */}

      <div
        className="
          mb-3
          shrink-0
          border-b
          border-[#E1E7F0]
          pb-3
        "
      >

        <div className="mb-2 flex items-center justify-between gap-2">

          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-[#8793AA]
            "
          >
            Filter by date
          </p>

          <span className="text-[10px] font-medium text-[#8793AA]">
            {PRESETS.find((item) => item.id === preset)?.label}
          </span>

        </div>

        {/* Filter buttons */}

        <div className="flex flex-wrap items-center gap-1.5">

          {PRESETS.map((item) => {

            const isActive = preset === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                aria-pressed={isActive}
                className={`
                  inline-flex
                  h-[30px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  px-3
                  text-[11px]
                  font-semibold
                  transition-all
                  duration-200
                  active:scale-95
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#F27B1E]

                  ${
                    isActive
                      ? "border-[#0A2E66] bg-[#0A2E66] text-white shadow-sm"
                      : "border-[#E1E7F0] bg-white text-[#64748B] hover:border-[#C8D6EA] hover:bg-[#F7F8FC]"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}

        </div>

        {/* Custom date range */}

        {preset === "custom" && (

          <div
            className="
              mt-3
              rounded-xl
              border
              border-[#E1E7F0]
              bg-[#F7F8FC]
              p-3
            "
          >

            <div className="grid grid-cols-2 gap-2">

              {/* From */}

              <label className="min-w-0">

                <span
                  className="
                    mb-1.5
                    block
                    text-[11px]
                    font-semibold
                    text-[#56647D]
                  "
                >
                  From date
                </span>

                <div className="relative">

                  <CalendarDays
                    size={14}
                    className="
                      pointer-events-none
                      absolute
                      left-2.5
                      top-1/2
                      -translate-y-1/2
                      text-[#8793AA]
                    "
                  />

                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="
                      h-[36px]
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-[#E1E7F0]
                      bg-white
                      pl-8
                      pr-1
                      text-[11px]
                      text-[#34445F]
                      outline-none
                      transition
                      focus:border-[#0A2E66]
                      focus:ring-2
                      focus:ring-[#0A2E66]/10
                    "
                  />

                </div>

              </label>

              {/* To */}

              <label className="min-w-0">

                <span
                  className="
                    mb-1.5
                    block
                    text-[11px]
                    font-semibold
                    text-[#56647D]
                  "
                >
                  To date
                </span>

                <div className="relative">

                  <CalendarDays
                    size={14}
                    className="
                      pointer-events-none
                      absolute
                      left-2.5
                      top-1/2
                      -translate-y-1/2
                      text-[#8793AA]
                    "
                  />

                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    className="
                      h-[36px]
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-[#E1E7F0]
                      bg-white
                      pl-8
                      pr-1
                      text-[11px]
                      text-[#34445F]
                      outline-none
                      transition
                      focus:border-[#0A2E66]
                      focus:ring-2
                      focus:ring-[#0A2E66]/10
                    "
                  />

                </div>

              </label>

            </div>

            {(from || to) && (

              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
                className="
                  mt-2
                  inline-flex
                  items-center
                  gap-1
                  text-[11px]
                  font-semibold
                  text-[#64748B]
                  transition-colors
                  hover:text-[#F27B1E]
                "
              >
                <X size={13} />
                Clear dates
              </button>

            )}

          </div>

        )}

      </div>

      {/* ================================== */}
      {/* MEETING LIST */}
      {/* ================================== */}

      <div
        className="
          meeting-scroll-admin
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          pr-1
        "
      >

        {/* LOADING */}

        {loading ? (

          <div className="space-y-2.5">

            {Array.from({ length: 3 }).map((_, index) => (

              <div
                key={index}
                className="
                  flex
                  gap-3
                  rounded-[15px]
                  border
                  border-[#E1E7F0]
                  p-3
                "
              >

                <Skeleton
                  width={62}
                  height={65}
                  borderRadius={12}
                />

                <div className="min-w-0 flex-1 space-y-2 pt-1">

                  <Skeleton height={14} width="65%" />

                  <Skeleton height={11} width="45%" />

                  <Skeleton height={11} width="55%" />

                </div>

              </div>

            ))}

          </div>

        ) : meetings.length > 0 ? (

          /* MEETING CARDS */

          <div className="space-y-2.5">

            {meetings.map((meeting) => {

              const typeStyle = getMeetingTypeStyle(meeting.updateType);
              const TypeIcon = typeStyle.icon;

              return (

                <Link
                  key={meeting._id}
                  href={`${clientBase}/${meeting.clientId}`}
                  className="
                    group
                    block
                    rounded-[16px]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#F27B1E]
                    focus-visible:ring-offset-2
                  "
                >

                  <article
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                      rounded-[16px]
                      border
                      border-[#E1E7F0]
                      bg-white
                      p-3
                      transition-all
                      duration-200
                      group-hover:border-[#C8D6EA]
                      group-hover:bg-[#F9FAFD]
                      group-hover:shadow-[0_4px_12px_rgba(10,46,102,0.05)]
                      sm:p-3.5
                    "
                  >

                    {/* DATE AND TIME */}

                    <div
                      className="
                        flex
                        w-[65px]
                        min-h-[76px]
                        shrink-0
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[#E1E7F0]
                        bg-[#F7F8FC]
                        px-1
                        py-2
                        transition-colors
                        duration-200
                        group-hover:border-[#F5D4B9]
                        group-hover:bg-[#FFF8F0]
                      "
                    >

                      <Clock
                        size={15}
                        className="mb-1.5 text-[#F27B1E]"
                      />

                      <span
                        className="
                          text-[11px]
                          font-bold
                          leading-4
                          text-[#0A2E66]
                          sm:text-xs
                        "
                      >
                        {formatMeetingTime(meeting.meetingAt)}
                      </span>

                      <span
                        className="
                          mt-1
                          text-[9px]
                          font-medium
                          leading-3
                          text-[#8793AA]
                        "
                      >
                        {formatMeetingDate(meeting.meetingAt)}
                      </span>

                    </div>

                    {/* MEETING DETAILS */}

                    <div className="min-w-0 flex-1">

                      {/* Client name and type icon */}

                      <div className="flex min-w-0 items-center justify-between gap-2">

                        <h3
                          className="
                            min-w-0
                            truncate
                            text-[14px]
                            font-semibold
                            leading-5
                            text-[#0F1B33]
                            transition-colors
                            group-hover:text-[#0A2E66]
                          "
                        >
                          {meeting.clientName || "Unknown client"}
                        </h3>

                        <div
                          className="
                            flex
                            h-8 w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                          "
                          style={{
                            background: typeStyle.background,
                            color: typeStyle.color,
                          }}
                        >
                          <TypeIcon size={16} strokeWidth={1.9} />
                        </div>

                      </div>

                      {/* Company */}

                      {meeting.company && (

                        <p
                          className="
                            mt-1
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            text-[11px]
                            leading-4
                            text-[#56647D]
                          "
                        >

                          <Building2
                            size={12}
                            className="shrink-0 text-[#8793AA]"
                          />

                          <span className="truncate">
                            {meeting.company}
                          </span>

                        </p>

                      )}

                      {/* Salesperson */}

                      <p
                        className="
                          mt-1
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                          text-[11px]
                          leading-4
                          text-[#8793AA]
                        "
                      >

                        <UserRound
                          size={12}
                          className="shrink-0"
                        />

                        <span className="shrink-0">
                          Assigned to
                        </span>

                        <span className="truncate font-semibold text-[#56647D]">
                          {meeting.salesPersonName || "Unknown"}
                        </span>

                      </p>

                      {/* Badges */}

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">

                        <span
                          className="
                            inline-flex
                            h-[22px]
                            items-center
                            rounded-full
                            px-2.5
                            text-[10px]
                            font-bold
                            capitalize
                          "
                          style={{
                            background: typeStyle.background,
                            color: typeStyle.color,
                          }}
                        >
                          {typeStyle.label}
                        </span>

                        {meeting.status && (

                          <span
                            className="
                              inline-flex
                              h-[22px]
                              items-center
                              rounded-full
                              border
                              border-[#E1E7F0]
                              bg-[#F7F8FC]
                              px-2.5
                              text-[10px]
                              font-semibold
                              capitalize
                              text-[#64748B]
                            "
                          >
                            {String(meeting.status).replace(/-/g, " ")}
                          </span>

                        )}

                      </div>

                      {/* Meeting note */}

                      {meeting.note && (

                        <p
                          className="
                            mt-2
                            line-clamp-2
                            break-words
                            rounded-lg
                            border
                            border-[#E1E7F0]
                            bg-[#F7F8FC]
                            px-2.5
                            py-1.5
                            text-[11px]
                            leading-5
                            text-[#56647D]
                          "
                        >
                          {meeting.note}
                        </p>

                      )}

                    </div>

                    {/* NAVIGATION INDICATOR */}

                    <div
                      className="
                        flex
                        h-7 w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-[#A0AABD]
                        transition-all
                        duration-200
                        group-hover:bg-[#E9EFF9]
                        group-hover:text-[#0A2E66]
                      "
                    >
                      <ChevronRight
                        size={17}
                        className="
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                        "
                      />
                    </div>

                  </article>

                </Link>

              );

            })}

          </div>

        ) : (

          /* EMPTY STATE */

          <div
            className="
              flex
              min-h-[170px]
              flex-col
              items-center
              justify-center
              rounded-[16px]
              border
              border-dashed
              border-[#E1E7F0]
              bg-[#F7F8FC]
              px-4
              py-7
              text-center
            "
          >

            <div
              className="
                mb-3
                flex
                h-11 w-11
                items-center
                justify-center
                rounded-xl
                bg-[#E9EFF9]
                text-[#376BB5]
              "
            >
              <CalendarDays size={22} />
            </div>

            <p
              className="
                text-[14px]
                font-semibold
                text-[#0A2E66]
              "
            >
              No meetings found
            </p>

            <p
              className="
                mt-1
                max-w-[240px]
                text-[12px]
                leading-5
                text-[#8793AA]
              "
            >
              There are no scheduled meetings for the selected date range.
            </p>

          </div>

        )}

      </div>

      {/* ================================== */}
      {/* FOOTER */}
      {/* ================================== */}

      {!loading && meetings.length > 0 && (

        <div
          className="
            mt-3
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-t
            border-[#E1E7F0]
            pt-3
          "
        >

          <p className="text-[11px] text-[#8793AA]">
            {meetings.length}{" "}
            {meetings.length === 1 ? "appointment" : "appointments"}
          </p>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-[11px]
              font-semibold
              text-[#0A2E66]
            "
          >
            <CalendarCheck size={13} />
            Scheduled
          </span>

        </div>

      )}

    </section>
  );
};

export default TodayMeeting;
