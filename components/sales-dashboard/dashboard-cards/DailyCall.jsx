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
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${iconColor}14`,
          color: iconColor,
        }}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-tight text-[#14213D] sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
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
      className="flex min-h-[96px] min-w-0 flex-col justify-between rounded-2xl p-3 sm:p-4"
      style={{ backgroundColor: background }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold sm:text-sm" style={{ color }}>
          {title}
        </span>

        <Icon size={17} className="shrink-0" style={{ color }} />
      </div>

      <p
        className="mt-3 text-2xl font-bold leading-none tracking-tight sm:text-[28px]"
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
  const company = call?.customerCompany;
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
    <article className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-[#E1E7F1] bg-white px-3 py-3 transition-colors hover:border-[#A8B7CE] hover:bg-[#FCFDFF] sm:gap-3 sm:px-4">
      {/* Avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white sm:h-11 sm:w-11 sm:text-sm"
        style={{ backgroundColor: badge.avatar }}
      >
        {getInitials(name)}
      </div>

      {/* Customer information */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            title={name}
            className="max-w-full truncate text-sm font-bold leading-tight text-[#14213D] sm:max-w-[190px] sm:text-base"
          >
            {name}
          </h3>

          {company && (
            <span
              title={company}
              className="max-w-[130px] truncate text-xs text-slate-500"
            >
              {company}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span
            title={phoneNumber || "No phone number"}
            className="max-w-full truncate text-xs text-slate-500 sm:text-sm"
          >
            {phoneNumber || "No phone number"}
          </span>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:text-[11px] ${badge.className}`}
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
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          aria-label={`Call ${name}`}
          title="Call client"
          onClick={(event) => {
            if (!phoneNumber) event.preventDefault();
          }}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${
            phoneNumber
              ? "bg-[#E4F5ED] text-[#16845B] hover:bg-[#16845B] hover:text-white"
              : "cursor-not-allowed bg-slate-100 text-slate-300"
          }`}
        >
          <Phone size={16} />
        </a>

        <button
          type="button"
          title="Message action not configured"
          aria-label={`Message ${name}`}
          disabled
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-[#E4F5ED] text-[#16845B] opacity-70 sm:h-10 sm:w-10"
        >
          <MessageCircle size={16} />
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${
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

  const missedCount = useMemo(
    () =>
      dateFilteredCalls.filter((call) => getCallStatus(call) === "missed")
        .length,
    [dateFilteredCalls],
  );

  const connectedCount = useMemo(
    () =>
      dateFilteredCalls.filter((call) => getCallStatus(call) === "connected")
        .length,
    [dateFilteredCalls],
  );

  const filteredCalls = useMemo(() => {
    if (callFilter === "missed") {
      return dateFilteredCalls.filter(
        (call) => getCallStatus(call) === "missed",
      );
    }

    if (callFilter === "connected") {
      return dateFilteredCalls.filter(
        (call) => getCallStatus(call) === "connected",
      );
    }

    return dateFilteredCalls;
  }, [dateFilteredCalls, callFilter]);

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

  const resetFilters = () => {
    setCallFilter("all");
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
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
      >
        <div className="rounded-[26px] border border-[#E1E7F1] bg-white p-5 shadow-sm sm:p-6">
          <Skeleton width={210} height={28} />
          <Skeleton width={170} height={18} className="mt-2" />

          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={68} borderRadius={16} />
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-[#E1E7F1] bg-white p-5 shadow-sm sm:p-6">
          <Skeleton width={190} height={28} />

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={96} borderRadius={18} />
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
    <div className="space-y-5">
      <section
        aria-label="Daily call activity"
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
      >
        {/* LEFT: Compact call list */}
        <div className="flex min-w-0 flex-col rounded-[26px] border border-[#E1E7F1] bg-white p-4 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              className="inline-flex items-center gap-2 rounded-xl border border-[#E1E7F1] px-3 py-2 text-xs font-semibold text-[#0A2E66] transition hover:bg-[#F5F7FB]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Status filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <CallFilterButton
              active={callFilter === "all"}
              onClick={() => changeFilter("all")}
            >
              All
              <span className="opacity-75">{dateFilteredCalls.length}</span>
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
          </div>

          {/* From / To date range */}
          <div className="mt-4 rounded-2xl border border-[#E8EDF5] bg-[#F8FAFD] p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={16} className="text-[#0A2E66]" />
              <span className="text-xs font-bold text-[#14213D] sm:text-sm">
                Custom date range
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <label
                  htmlFor="daily-call-from-date"
                  className="mb-1.5 block text-xs font-medium text-slate-500"
                >
                  From date
                </label>

                <input
                  id="daily-call-from-date"
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => changeFromDate(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-[#DCE3EF] bg-white px-2.5 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10 sm:px-3"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="daily-call-to-date"
                  className="mb-1.5 block text-xs font-medium text-slate-500"
                >
                  To date
                </label>

                <input
                  id="daily-call-to-date"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => changeToDate(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-[#DCE3EF] bg-white px-2.5 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0A2E66] focus:ring-2 focus:ring-[#0A2E66]/10 sm:px-3"
                />
              </div>

              {hasDateFilter && (
                <button
                  type="button"
                  onClick={clearDateRange}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F0D6D2] bg-white px-3 py-2 text-xs font-semibold text-[#D63C30] transition hover:bg-red-50"
                >
                  <X size={14} />
                  Clear dates
                </button>
              )}
            </div>

            {hasDateFilter && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {fromDate && toDate
                  ? `Showing calls from ${fromDate} through ${toDate}, inclusive.`
                  : fromDate
                    ? `Showing calls from ${fromDate} onward.`
                    : `Showing calls through ${toDate}.`}
              </p>
            )}
          </div>

          {/* Exactly four or fewer call items per page */}
          <div className="mt-4 flex-1 space-y-2.5">
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
              <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8E0ED] bg-[#F8FAFD] px-5 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FA] text-[#0A2E66]">
                  <PhoneCall size={21} />
                </div>

                <p className="mt-3 text-sm font-semibold text-[#14213D]">
                  No calls found
                </p>

                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                  Try another status or date range to find call activity.
                </p>

                {(hasDateFilter || callFilter !== "all") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 rounded-xl bg-[#0A2E66] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#153F80]"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCalls.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t border-[#E8EDF5] pt-4 sm:flex-row sm:items-center sm:justify-between">
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
                  className="inline-flex items-center gap-1 rounded-xl border border-[#DCE3EF] px-3 py-2 text-xs font-semibold text-[#0A2E66] transition hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="inline-flex items-center gap-1 rounded-xl bg-[#0A2E66] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#153F80] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#F5F7FB] p-3">
            <Activity size={17} className="mt-0.5 shrink-0 text-[#F27B1E]" />

            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              Review recent activity and follow up with clients who need a
              response.
            </p>
          </div>
        </div>

        {/* RIGHT: Daily call statistics */}
        <aside className="flex min-w-0 flex-col rounded-[26px] border border-[#E1E7F1] bg-white p-4 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-5 lg:p-6">
          <PanelHeader
            icon={TrendingUp}
            title="My calls today"
            subtitle={`${formatNumber(totalCalls)} calls so far`}
            iconColor="#3767A6"
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
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

          <div className="mt-4 rounded-2xl border border-[#E8EDF5] bg-[#F7F8FC] p-3.5">
            <div className="flex items-center gap-2">
              <Users size={17} className="shrink-0 text-[#3767A6]" />

              <span className="text-sm font-semibold text-[#14213D]">
                Unique clients reached
              </span>

              <span className="ml-auto text-lg font-bold text-[#0A2E66]">
                {formatNumber(uniqueCustomerCount)}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-[#F7F8FC] p-3.5">
            <p className="text-sm leading-relaxed text-slate-600">
              {getCallInsight()}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-2xl border border-[#DCEFE5] bg-[#F6FBF8] p-3">
              <div className="flex items-center gap-2 text-[#16845B]">
                <ArrowDown size={16} />
                <span className="text-xs font-semibold">Inbound</span>
              </div>

              <p className="mt-2 text-xl font-bold text-[#14213D]">
                {formatNumber(inboundCalls)}
              </p>
            </div>

            <div className="rounded-2xl border border-[#F8E4D4] bg-[#FFFAF5] p-3">
              <div className="flex items-center gap-2 text-[#D96A12]">
                <PhoneOutgoing size={16} />
                <span className="text-xs font-semibold">Outbound</span>
              </div>

              <p className="mt-2 text-xl font-bold text-[#14213D]">
                {formatNumber(outboundCalls)}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default DailyCall;
