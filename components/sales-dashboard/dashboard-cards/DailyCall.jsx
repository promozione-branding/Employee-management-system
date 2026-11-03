// components/sales-dashboard/dashboard-cards/DailyCall.jsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Users,
  Clock3,
  TrendingUp,
  ArrowDown,
  MessageCircle,
  Activity,
  PhoneOutgoing,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  RefreshCw,
  Search,
} from "lucide-react";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallStatsService } from "@/service/sales-dashboard/dashboard-api";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";
const CALLS_PER_PAGE = 4;

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getInitials = (name = "Unknown Client") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getCallStatus = (call) => {
  const status = String(call?.status || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-");

  if (
    [
      "missed",
      "failed",
      "busy",
      "cancelled",
      "canceled",
      "no-answer",
      "no answer",
    ].includes(status)
  ) {
    return "missed";
  }

  if (
    call?.connected === true ||
    ["connected", "completed", "answered"].includes(status)
  ) {
    return "connected";
  }

  return "pending";
};

const getCallDate = (call) => {
  const rawDate =
    call?.createdAt ||
    call?.callDate ||
    call?.date ||
    call?.startedAt ||
    call?.timestamp;

  if (!rawDate) return null;

  const date = new Date(rawDate);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatCallDateTime = (call) => {
  const date = getCallDate(call);
  if (!date) return "";

  const day = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}, ${time}`;
};

const getCallDateKey = (call) => {
  const date = getCallDate(call);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function PanelHeader({ icon: Icon, title, subtitle, iconColor = NAVY }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${iconColor}14`,
          color: iconColor,
        }}
      >
        <Icon size={17} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold leading-tight text-[#14213D] sm:text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="text-[11px] text-slate-500 sm:text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  background,
  suffix = "",
}) {
  return (
    <div
      className="flex min-h-[64px] min-w-0 flex-col justify-between rounded-xl p-2.5 sm:p-3"
      style={{ backgroundColor: background }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-semibold sm:text-xs"
          style={{ color }}
        >
          {title}
        </span>

        <Icon size={15} className="shrink-0" style={{ color }} />
      </div>

      <p
        className="mt-1.5 text-xl font-bold leading-none tracking-tight sm:text-2xl"
        style={{ color }}
      >
        {value}

        {suffix && <span className="ml-1 text-sm font-semibold">{suffix}</span>}
      </p>
    </div>
  );
}

function RecentCallItem({ call }) {
  const name = call?.customerName || "Unknown Client";
  const company =
    call?.customerCompany || call?.company || call?.customer?.company || "";
  const status = getCallStatus(call);

  const phoneNumber =
    call?.customerPhone || call?.toNumber || call?.fromNumber || "";

  const statusStyles = {
    missed: {
      label: "Missed",
      icon: PhoneMissed,
      className: "bg-[#FDEAE7] text-[#D63C30]",
      avatar: "#B9580A",
    },
    connected: {
      label: "Connected",
      icon: PhoneCall,
      className: "bg-[#E4F5ED] text-[#16845B]",
      avatar: "#31568C",
    },
    pending: {
      label: "Pending",
      icon: Clock3,
      className: "bg-[#FFF0E3] text-[#D96A12]",
      avatar: "#7150D8",
    },
  };

  const badge = statusStyles[status];
  const StatusIcon = badge.icon;

  return (
    <article className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E1E7F1] bg-white px-2.5 py-2 transition-colors hover:border-[#A8B7CE] hover:bg-[#FCFDFF] sm:gap-2.5 sm:px-3">
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white sm:text-xs"
        style={{ backgroundColor: badge.avatar }}
      >
        {getInitials(name)}
      </div>

      {/* Customer information */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            title={name}
            className="max-w-full truncate text-[13px] font-bold leading-tight text-[#14213D] sm:max-w-[170px] sm:text-sm"
          >
            {name}
          </h3>

          {company && (
            <span
              title={company}
              className="max-w-[140px] truncate text-[11px] font-medium text-[#3767A6] sm:text-xs"
            >
              · {company}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            title={phoneNumber || "No phone number"}
            className="max-w-full truncate text-[11px] text-slate-500 sm:text-xs"
          >
            {phoneNumber || "No phone number"}
          </span>

          {formatCallDateTime(call) && (
            <span
              title={getCallDate(call)?.toLocaleString("en-IN")}
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-400 sm:text-[11px]"
            >
              <Clock3 size={10} />
              {formatCallDateTime(call)}
            </span>
          )}

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}
          >
            <StatusIcon size={11} />
            {badge.label}
          </span>

          {call?.amount != null && (
            <span className="shrink-0 text-xs font-semibold text-[#0A2E66]">
              {formatCurrency(call.amount)}
            </span>
          )}
        </div>
      </div>

      {/* Actions stay on the same row */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          aria-label={`Call ${name}`}
          title="Call client"
          onClick={(event) => {
            if (!phoneNumber) event.preventDefault();
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            phoneNumber
              ? "bg-[#E4F5ED] text-[#16845B] hover:bg-[#16845B] hover:text-white"
              : "cursor-not-allowed bg-slate-100 text-slate-300"
          }`}
        >
          <Phone size={14} />
        </a>

        <button
          type="button"
          title="Message action not configured"
          aria-label={`Message ${name}`}
          disabled
          className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-[#E4F5ED] text-[#16845B] opacity-70"
        >
          <MessageCircle size={14} />
        </button>
      </div>
    </article>
  );
}

function CallFilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
        active
          ? "border-[#0A2E66] bg-[#0A2E66] text-white shadow-sm"
          : "border-[#E1E7F1] bg-white text-slate-600 hover:border-[#9AAAC4] hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

const DailyCall = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);

  const [callFilter, setCallFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [callPage, setCallPage] = useState(0);

  const employeeId = employee?.user?._id;

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      setRecentCalls([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [statsResult, historyResult] = await Promise.allSettled([
        dailyCallStatsService(employeeId),
        axios.get("/api/calling/history", {
          params: {
            scope: "self",
            limit: 100,
          },
        }),
      ]);

      if (statsResult.status === "fulfilled" && statsResult.value?.success) {
        setStats(statsResult.value.data || {});
      } else {
        console.error(
          "Failed to fetch daily call statistics:",
          statsResult.status === "rejected"
            ? statsResult.reason
            : statsResult.value,
        );

        toast.error("Unable to load daily call statistics");
      }

      if (
        historyResult.status === "fulfilled" &&
        historyResult.value?.data?.success
      ) {
        const calls = historyResult.value.data.data;

        setRecentCalls(Array.isArray(calls) ? calls : []);
      } else {
        console.error(
          "Failed to fetch call history:",
          historyResult.status === "rejected"
            ? historyResult.reason
            : historyResult.value,
        );

        toast.error("Unable to load recent calls");
      }
    } catch (error) {
      console.error("Failed to fetch daily call data:", error);
      toast.error("Unable to load daily call data");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records by the selected inclusive date range.
  const dateFilteredCalls = useMemo(() => {
    return recentCalls.filter((call) => {
      const dateKey = getCallDateKey(call);

      // Exclude records without a usable date when a date
      // range has been applied.
      if (!fromDate && !toDate) return true;
      if (!dateKey) return false;

      if (fromDate && dateKey < fromDate) return false;
      if (toDate && dateKey > toDate) return false;

      return true;
    });
  }, [recentCalls, fromDate, toDate]);

  // Then narrow by the search text (client name or company name).
  const searchedCalls = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return dateFilteredCalls;

    return dateFilteredCalls.filter((call) => {
      const name = String(call?.customerName || "").toLowerCase();
      const company = String(
        call?.customerCompany || call?.company || call?.customer?.company || "",
      ).toLowerCase();

      return name.includes(query) || company.includes(query);
    });
  }, [dateFilteredCalls, searchQuery]);

  const missedCount = useMemo(
    () =>
      searchedCalls.filter((call) => getCallStatus(call) === "missed").length,
    [searchedCalls],
  );

  const connectedCount = useMemo(
    () =>
      searchedCalls.filter((call) => getCallStatus(call) === "connected")
        .length,
    [searchedCalls],
  );

  const filteredCalls = useMemo(() => {
    if (callFilter === "missed") {
      return searchedCalls.filter((call) => getCallStatus(call) === "missed");
    }

    if (callFilter === "connected") {
      return searchedCalls.filter(
        (call) => getCallStatus(call) === "connected",
      );
    }

    return searchedCalls;
  }, [searchedCalls, callFilter]);

  const totalCallPages = Math.ceil(filteredCalls.length / CALLS_PER_PAGE);

  const visibleCalls = useMemo(() => {
    const startIndex = callPage * CALLS_PER_PAGE;

    return filteredCalls.slice(startIndex, startIndex + CALLS_PER_PAGE);
  }, [filteredCalls, callPage]);

  const firstVisibleCall =
    filteredCalls.length === 0 ? 0 : callPage * CALLS_PER_PAGE + 1;

  const lastVisibleCall = Math.min(
    (callPage + 1) * CALLS_PER_PAGE,
    filteredCalls.length,
  );

  const changeFilter = (filter) => {
    setCallFilter(filter);
    setCallPage(0);
  };

  const changeFromDate = (value) => {
    setFromDate(value);
    setCallPage(0);

    // Keep the date range valid when the start date changes.
    if (toDate && value && value > toDate) {
      setToDate(value);
    }
  };

  const changeToDate = (value) => {
    setToDate(value);
    setCallPage(0);

    // Keep the date range valid when the end date changes.
    if (fromDate && value && value < fromDate) {
      setFromDate(value);
    }
  };

  const clearDateRange = () => {
    setFromDate("");
    setToDate("");
    setCallPage(0);
  };

  const changeSearch = (value) => {
    setSearchQuery(value);
    setCallPage(0);
  };

  const resetFilters = () => {
    setCallFilter("all");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setCallPage(0);
  };

  const goToCallPage = (nextPage) => {
    setCallPage(
      Math.max(0, Math.min(nextPage, Math.max(0, totalCallPages - 1))),
    );
  };

  if (loading) {
    return (
      <section
        aria-label="Loading daily call activity"
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
      >
        <div className="rounded-2xl border border-[#E1E7F1] bg-white p-4 shadow-sm">
          <Skeleton width={210} height={24} />
          <Skeleton width={170} height={16} className="mt-1" />

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={52} borderRadius={12} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E1E7F1] bg-white p-4 shadow-sm">
          <Skeleton width={190} height={24} />

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={64} borderRadius={12} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const s = stats || {};

  const totalCalls = Number(s.totalCalls || 0);
  const connectedCalls = Number(s.connectedCalls || 0);
  const missedCalls = Number(s.missedCalls || 0);
  const uniqueCustomerCount = Number(s.uniqueCustomerCount || 0);
  const totalTalkMinutes = Number(s.totalTalkMinutes || 0);
  const connectRate = Number(s.connectRate || 0);
  const inboundCalls = Number(s.inboundCalls || 0);
  const outboundCalls = Number(s.outboundCalls || 0);

  const getCallInsight = () => {
    if (totalCalls === 0) {
      return "No calls have been recorded today. Start connecting with your clients to build momentum.";
    }

    if (connectRate >= 70) {
      return `Your connect rate is ${connectRate}%. Excellent work—keep the momentum going.`;
    }

    if (connectRate >= 40) {
      return `Your connect rate is ${connectRate}%. Consistent follow-ups can help improve engagement.`;
    }

    return `Your connect rate is ${connectRate}%. Consider reviewing your follow-up timing to improve engagement.`;
  };

  const hasDateFilter = Boolean(fromDate || toDate);

  return (
    <section
      aria-label="Daily call activity"
      className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
    >
      {/* LEFT: Compact call list */}
      <div className="flex min-w-0 flex-col rounded-2xl border border-[#E1E7F1] bg-white p-3 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PanelHeader
            icon={Phone}
            title="Call activity"
            subtitle={`${formatNumber(filteredCalls.length)} ${
              filteredCalls.length === 1 ? "call" : "calls"
            } found`}
            iconColor="#16845B"
          />

          <button
            type="button"
            onClick={fetchData}
            title="Refresh call activity"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E7F1] px-2.5 py-1.5 text-xs font-semibold text-[#0A2E66] transition hover:bg-[#F5F7FB]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Status filters + date range share one toolbar row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E8EDF5] bg-[#F8FAFD] p-2">
          <CallFilterButton
            active={callFilter === "all"}
            onClick={() => changeFilter("all")}
          >
            All
            <span className="opacity-75">{searchedCalls.length}</span>
          </CallFilterButton>

          <CallFilterButton
            active={callFilter === "missed"}
            onClick={() => changeFilter("missed")}
          >
            <PhoneMissed size={13} />
            Missed
            <span
              className={
                callFilter === "missed" ? "opacity-75" : "text-[#D63C30]"
              }
            >
              {missedCount}
            </span>
          </CallFilterButton>

          <CallFilterButton
            active={callFilter === "connected"}
            onClick={() => changeFilter("connected")}
          >
            <PhoneCall size={13} />
            Connected
            <span
              className={
                callFilter === "connected" ? "opacity-75" : "text-[#16845B]"
              }
            >
              {connectedCount}
            </span>
          </CallFilterButton>

          {/* Search by client name or company name */}
          <div className="relative min-w-[150px] flex-1 sm:max-w-[210px]">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="daily-call-search"
              type="search"
              value={searchQuery}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search name / company"
              aria-label="Search calls by client name or company name"
              className="w-full min-w-0 rounded-full border border-[#E1E7F1] bg-white py-1.5 pl-7 pr-7 text-[11px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10 sm:text-xs [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => changeSearch("")}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-[#DCE3EF] lg:block"
          />

          {/* From / To date range, inline with the status filters */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#14213D] sm:text-xs">
              <CalendarDays size={14} className="text-[#0A2E66]" />
              Custom date range
            </span>

            <div className="flex min-w-0 items-center gap-1.5">
              <label
                htmlFor="daily-call-from-date"
                className="whitespace-nowrap text-[11px] font-medium text-slate-500"
              >
                From
              </label>

              <input
                id="daily-call-from-date"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => changeFromDate(event.target.value)}
                className="w-[138px] min-w-0 rounded-lg border border-[#DCE3EF] bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10"
              />
            </div>

            <div className="flex min-w-0 items-center gap-1.5">
              <label
                htmlFor="daily-call-to-date"
                className="whitespace-nowrap text-[11px] font-medium text-slate-500"
              >
                To
              </label>

              <input
                id="daily-call-to-date"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => changeToDate(event.target.value)}
                className="w-[138px] min-w-0 rounded-lg border border-[#DCE3EF] bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10"
              />
            </div>

            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDateRange}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#F0D6D2] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#D63C30] transition hover:bg-red-50"
              >
                <X size={13} />
                Clear dates
              </button>
            )}
          </div>
        </div>

        {hasDateFilter && (
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
            {fromDate && toDate
              ? `Showing calls from ${fromDate} through ${toDate}, inclusive.`
              : fromDate
                ? `Showing calls from ${fromDate} onward.`
                : `Showing calls through ${toDate}.`}
          </p>
        )}

        {/* Exactly four or fewer call items per page, in two columns where wide enough */}
        <div className="mt-3 grid flex-1 content-start gap-2 md:grid-cols-2">
          {visibleCalls.length > 0 ? (
            visibleCalls.map((call, index) => (
              <RecentCallItem
                key={
                  call?._id ||
                  `${getCallDateKey(call)}-${call?.customerPhone || call?.toNumber || "call"}-${index}`
                }
                call={call}
              />
            ))
          ) : (
            <div className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D8E0ED] bg-[#F8FAFD] px-4 py-3 text-center md:col-span-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0FA] text-[#0A2E66]">
                <PhoneCall size={18} />
              </div>

              <p className="mt-2 text-sm font-semibold text-[#14213D]">
                No calls found
              </p>

              <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-slate-500">
                Try another status or date range to find call activity.
              </p>

              {(hasDateFilter || callFilter !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 rounded-lg bg-[#0A2E66] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#153F80]"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredCalls.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 border-t border-[#E8EDF5] pt-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#14213D]">
                {firstVisibleCall}–{lastVisibleCall}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#14213D]">
                {filteredCalls.length}
              </span>{" "}
              calls
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => goToCallPage(callPage - 1)}
                disabled={callPage === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-[#DCE3EF] px-2.5 py-1.5 text-xs font-semibold text-[#0A2E66] transition hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="whitespace-nowrap text-xs font-semibold text-slate-600">
                Page {callPage + 1} of {Math.max(1, totalCallPages)}
              </span>

              <button
                type="button"
                onClick={() => goToCallPage(callPage + 1)}
                disabled={callPage >= totalCallPages - 1}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0A2E66] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#153F80] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F5F7FB] px-2.5 py-2">
          <Activity size={15} className="shrink-0 text-[#F27B1E]" />

          <p className="text-[11px] leading-snug text-slate-600 sm:text-xs">
            Review recent activity and follow up with clients who need a
            response.
          </p>
        </div>
      </div>

      {/* RIGHT: Daily call statistics */}
      <aside className="flex min-w-0 flex-col rounded-2xl border border-[#E1E7F1] bg-white p-3 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-4">
        <PanelHeader
          icon={TrendingUp}
          title="My calls today"
          subtitle={`${formatNumber(totalCalls)} calls so far`}
          iconColor="#3767A6"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricCard
            title="Connected"
            value={formatNumber(connectedCalls)}
            icon={PhoneCall}
            color="#16845B"
            background="#E4F5ED"
          />

          <MetricCard
            title="Missed"
            value={formatNumber(missedCalls)}
            icon={PhoneMissed}
            color="#D63C30"
            background="#FDEAE7"
          />

          <MetricCard
            title="Talk time"
            value={formatNumber(totalTalkMinutes)}
            suffix="m"
            icon={Clock3}
            color="#7050D8"
            background="#F0EBFF"
          />

          <MetricCard
            title="Connect rate"
            value={formatNumber(connectRate)}
            suffix="%"
            icon={TrendingUp}
            color="#3767A6"
            background="#EAF0FA"
          />
        </div>

        <div className="mt-2.5 rounded-xl border border-[#E8EDF5] bg-[#F7F8FC] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0 text-[#3767A6]" />

            <span className="text-xs font-semibold text-[#14213D] sm:text-sm">
              Unique clients reached
            </span>

            <span className="ml-auto text-base font-bold text-[#0A2E66]">
              {formatNumber(uniqueCustomerCount)}
            </span>
          </div>
        </div>

        <div className="mt-2 rounded-xl bg-[#F7F8FC] px-3 py-2.5">
          <p className="text-xs leading-snug text-slate-600">
            {getCallInsight()}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          <div className="rounded-xl border border-[#DCEFE5] bg-[#F6FBF8] p-2.5">
            <div className="flex items-center gap-1.5 text-[#16845B]">
              <ArrowDown size={14} />
              <span className="text-[11px] font-semibold">Inbound</span>
            </div>

            <p className="mt-1 text-lg font-bold leading-tight text-[#14213D]">
              {formatNumber(inboundCalls)}
            </p>
          </div>

          <div className="rounded-xl border border-[#F8E4D4] bg-[#FFFAF5] p-2.5">
            <div className="flex items-center gap-1.5 text-[#D96A12]">
              <PhoneOutgoing size={14} />
              <span className="text-[11px] font-semibold">Outbound</span>
            </div>

            <p className="mt-1 text-lg font-bold leading-tight text-[#14213D]">
              {formatNumber(outboundCalls)}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default DailyCall;
