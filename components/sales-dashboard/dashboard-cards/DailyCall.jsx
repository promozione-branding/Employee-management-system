// components/sales-dashboard/dashboard-cards/DailyCall.jsx

"use client";

import { useCallback, useEffect, useState } from "react";
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
  ArrowUp,
  MessageCircle,
  Activity,
  PhoneOutgoing,
} from "lucide-react";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallStatsService } from "@/service/sales-dashboard/dashboard-api";



const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

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
  const status = String(call?.status || "").toLowerCase();

  if (
    ["missed", "failed", "busy", "cancelled", "canceled"].includes(status)
  ) {
    return "missed";
  }

  if (call?.connected) return "connected";

  return "pending";
};

function PanelHeader({ icon: Icon, title, subtitle, iconColor = NAVY }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `${iconColor}14`,
          color: iconColor,
        }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <h2 className="font-serif text-lg font-bold leading-tight text-[#14213D] sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
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
      className="flex min-h-[104px] min-w-0 flex-col justify-between rounded-[20px] p-3.5 sm:p-4"
      style={{ backgroundColor: background }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-semibold sm:text-sm"
          style={{ color }}
        >
          {title}
        </span>

        <Icon className="shrink-0" size={18} style={{ color }} />
      </div>

      <p
        className="mt-3 text-2xl font-bold leading-none tracking-tight sm:text-[30px]"
        style={{ color }}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-semibold">{suffix}</span>
        )}
      </p>
    </div>
  );
}

function RecentCallItem({ call }) {
  const name = call?.customerName || "Unknown Client";
  const company = call?.customerCompany;
  const status = getCallStatus(call);

  const phoneNumber = call?.customerPhone || call?.toNumber || "";

  const statusStyles = {
    missed: {
      label: "Missed call",
      icon: PhoneMissed,
      className: "bg-[#FDEAE7] text-[#D63C30]",
    },
    connected: {
      label: "Connected",
      icon: PhoneCall,
      className: "bg-[#E4F5ED] text-[#16845B]",
    },
    pending: {
      label: "Pending",
      icon: Clock3,
      className: "bg-[#FFF0E3] text-[#D96A12]",
    },
  };

  const badge = statusStyles[status];
  const StatusIcon = badge.icon;

  return (
    <article className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#E1E7F1] bg-white p-3 transition-all duration-200 hover:border-[#9AAAC4] hover:shadow-[0_5px_18px_rgba(10,46,102,0.06)] sm:gap-4 sm:p-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white sm:h-12 sm:w-12"
        style={{
          backgroundColor:
            status === "missed"
              ? "#B9580A"
              : status === "connected"
                ? "#31568C"
                : "#7150D8",
        }}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
          <h3 className="max-w-full truncate text-sm font-bold text-[#14213D] sm:text-base">
            {name}
          </h3>

          {company && (
            <span className="max-w-full truncate text-xs text-slate-500 sm:text-sm">
              · {company}
            </span>
          )}
        </div>

        <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 sm:text-sm">
          {phoneNumber || "No phone number"}
          <span className="mx-1">·</span>
          {call?.status || (call?.connected ? "Connected" : "Call activity")}
          {call?.amount != null && ` · ${formatCurrency(call.amount)}`}
        </p>

        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
          >
            <StatusIcon size={12} />
            {badge.label}
          </span>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <a
          href={phoneNumber ? `tel:${phoneNumber}` : undefined}
          aria-label={`Call ${name}`}
          title="Call client"
          onClick={(event) => {
            if (!phoneNumber) event.preventDefault();
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            phoneNumber
              ? "bg-[#E4F5ED] text-[#16845B] hover:bg-[#16845B] hover:text-white"
              : "cursor-not-allowed bg-slate-100 text-slate-300"
          }`}
        >
          <Phone size={17} />
        </a>

        <button
          type="button"
          title="Message action not configured"
          aria-label={`Message ${name}`}
          disabled
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-[#E4F5ED] text-[#16845B] opacity-70"
        >
          <MessageCircle size={17} />
        </button>
      </div>
    </article>
  );
}

const DailyCall = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);

  const employeeId = employee?.user?._id;

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [statsResult, historyResult] = await Promise.allSettled([
        dailyCallStatsService(employeeId),
        axios.get("/api/calling/history?scope=self&limit=5"),
      ]);

      if (statsResult.status === "fulfilled" && statsResult.value?.success) {
        setStats(statsResult.value.data || {});
      } else if (statsResult.status === "rejected") {
        console.error("Failed to fetch daily call statistics:", statsResult.reason);
        toast.error("Unable to load daily call statistics");
      }

      if (
        historyResult.status === "fulfilled" &&
        historyResult.value?.data?.success
      ) {
        setRecentCalls(historyResult.value.data.data || []);
      } else if (historyResult.status === "rejected") {
        console.error("Failed to fetch call history:", historyResult.reason);
        toast.error("Unable to load recent calls");
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <section className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[26px] border border-[#E1E7F1] bg-white p-5 shadow-sm sm:p-6">
          <Skeleton width={210} height={28} />
          <Skeleton width={170} height={18} className="mt-2" />

          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={100} borderRadius={18} />
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-[#E1E7F1] bg-white p-5 shadow-sm sm:p-6">
          <Skeleton width={190} height={28} />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={105} borderRadius={18} />
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

  return (
    <div className="space-y-5">
      {/* Main calls section: wide activity list + narrow statistics panel */}
      <section
        aria-label="Daily call activity"
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]"
      >
        {/* LEFT: Recent call list */}
        <div className="flex min-w-0 flex-col rounded-[26px] border border-[#E1E7F1] bg-white p-4 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PanelHeader
              icon={Phone}
              title="Call activity"
              subtitle={`${recentCalls.length} recent ${
                recentCalls.length === 1 ? "call" : "calls"
              }`}
              iconColor="#16845B"
            />

            <span className="inline-flex items-center gap-2 rounded-full bg-[#E4F5ED] px-3 py-1.5 text-xs font-semibold text-[#16845B]">
              <span className="h-2 w-2 rounded-full bg-[#16845B]" />
              Today&apos;s activity
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#0A2E66] px-4 py-2 text-xs font-semibold text-white">
              All <span className="ml-1 opacity-80">{recentCalls.length}</span>
            </span>

            <span className="rounded-full border border-[#E1E7F1] bg-white px-4 py-2 text-xs font-medium text-slate-600">
              Missed{" "}
              <span className="ml-1 font-semibold text-[#D63C30]">
                {recentCalls.filter((call) => getCallStatus(call) === "missed").length}
              </span>
            </span>

            <span className="rounded-full border border-[#E1E7F1] bg-white px-4 py-2 text-xs font-medium text-slate-600">
              Connected{" "}
              <span className="ml-1 font-semibold text-[#16845B]">
                {recentCalls.filter((call) => getCallStatus(call) === "connected").length}
              </span>
            </span>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {recentCalls.length > 0 ? (
              recentCalls.map((call) => (
                <RecentCallItem key={call._id} call={call} />
              ))
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8E0ED] bg-[#F8FAFD] px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0FA] text-[#0A2E66]">
                  <PhoneCall size={22} />
                </div>

                <p className="mt-3 font-semibold text-[#14213D]">
                  No recent calls
                </p>

                <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
                  Recent call activity will appear here when available.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F5F7FB] p-4">
            <div className="mt-0.5 text-[#F27B1E]">
              <Activity size={18} />
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Review recent activity and follow up with clients who need a
              response.
            </p>
          </div>
        </div>

        {/* RIGHT: Daily call statistics */}
        <aside className="flex min-w-0 flex-col rounded-[26px] border border-[#E1E7F1] bg-white p-4 shadow-[0_6px_24px_rgba(10,46,102,0.04)] sm:p-6">
          <PanelHeader
            icon={TrendingUp}
            title="My calls today"
            subtitle={`${formatNumber(totalCalls)} calls so far`}
            iconColor="#3767A6"
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
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

          <div className="mt-5 rounded-2xl border border-[#E8EDF5] bg-[#F7F8FC] p-4">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-[#3767A6]" />

              <span className="text-sm font-semibold text-[#14213D]">
                Unique clients reached
              </span>

              <span className="ml-auto text-lg font-bold text-[#0A2E66]">
                {formatNumber(uniqueCustomerCount)}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F7F8FC] p-4">
            <p className="text-sm leading-relaxed text-slate-600">
              {getCallInsight()}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
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