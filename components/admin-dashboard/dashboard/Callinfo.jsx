
"use client";

import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Users,
  Clock3,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Headphones,
} from "lucide-react";

import toast from "react-hot-toast";
import { getAdminDailyCallStatsService } from "@/service/calling";
import Link from "next/link";

// ========================================
// MAIN COMPONENT
// ========================================

const Callinfo = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState({
    agents: [],
    totals: null,
  });

  // ========================================
  // FETCH CALL STATISTICS
  // ========================================

  async function fetchStats(isManual = false) {
    if (isManual) setRefreshing(true);

    try {
      const res = await getAdminDailyCallStatsService();

      if (res?.success) {
        setData(res.data || {
          agents: [],
          totals: null,
        });
      }
    } catch (err) {
      console.error("Failed to load call statistics:", err);

      toast.error(
        err?.message || "Failed to load call info"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ========================================
  // AUTO REFRESH
  // ========================================

  useEffect(() => {
    fetchStats();

    const intervalId = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // ========================================
  // LOADING UI
  // ========================================

  if (loading) {
    return (
      <section className="min-w-0 rounded-[25px] border border-[#E1E7F0] bg-white p-5 shadow-[0_3px_12px_rgba(10,46,102,0.04)] sm:p-7">

        <div className="mb-7 flex items-center gap-3">
          <Skeleton
            height={50}
            width={50}
            borderRadius={15}
          />

          <div>
            <Skeleton height={24} width={220} />
            <Skeleton height={17} width={280} />
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              height={104}
              borderRadius={20}
            />
          ))}
        </div>

        <Skeleton height={35} className="mb-3" />
        <Skeleton height={75} count={3} className="mb-2" />

      </section>
    );
  }

  const { agents = [], totals } = data;

  return (
    <section
      aria-label="Team call activity"
      className="
        min-w-0 overflow-hidden
        rounded-[25px]
        border border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.04)]
        transition-shadow duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:p-6
        lg:p-7
      "
    >

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        {/* Left heading */}
        <div className="flex min-w-0 items-center gap-3.5">

          <div className="
            flex h-[50px] w-[50px] shrink-0
            items-center justify-center
            rounded-[15px]
            bg-[#E9EFF9]
            text-[#376BB5]
          ">
            <Phone size={25} strokeWidth={1.9} />
          </div>

          <div className="min-w-0">

            <h2 className="
              font-serif
              text-[23px]
              font-bold
              leading-tight
              tracking-tight
              text-[#0A2E66]
              sm:text-[25px]
            ">
              Team call activity
            </h2>

            <p className="
              mt-1
              text-[15px]
              font-normal
              leading-5
              text-[#56647D]
              sm:text-[16px]
            ">
              Live overview of every agent&apos;s calls today
            </p>

          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-3">

          {/* Refresh */}
          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            aria-label="Refresh call statistics"
            className="
              flex h-[52px] w-[52px]
              items-center justify-center
              rounded-[16px]
              border border-[#E1E7F0]
              bg-white
              text-[#0A2E66]
              transition-all duration-200
              hover:border-[#C8D6EA]
              hover:bg-[#F2F4F9]
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={23}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          {/* View all logs */}
          <Link
            href="/dashboard/calling"
            className="
              inline-flex h-[44px]
              items-center justify-center
              gap-2
              rounded-[13px]
              border border-[#E1E7F0]
              bg-[#F7F8FC]
              px-4
              text-[14px]
              font-bold
              whitespace-nowrap
              text-[#0A2E66]
              transition-all duration-200
              hover:border-[#D3DCEC]
              hover:bg-[#E9EFF9]
              active:scale-[0.98]
            "
          >
            View all logs
            <ArrowUpRight
              size={16}
              className="text-[#F27B1E]"
            />
          </Link>

        </div>
      </div>

      {/* ================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================== */}

      {totals && (
        <div className="
          mb-7
          grid
          grid-cols-2
          gap-3
          sm:gap-4
          lg:grid-cols-4
        ">

          <SummaryTile
            icon={PhoneCall}
            label="Connected"
            value={totals.connectedCalls ?? 0}
            tone="emerald"
          />

          <SummaryTile
            icon={PhoneMissed}
            label="Missed"
            value={totals.missedCalls ?? 0}
            tone="red"
          />

          <SummaryTile
            icon={Clock3}
            label="Talk time"
            value={`${totals.totalTalkMinutes || 0}m`}
            tone="purple"
          />

          <SummaryTile
            icon={TrendingUp}
            label="Connect rate"
            value={`${totals.connectRate || 0}%`}
            tone="blue"
          />

        </div>
      )}

      {/* ================================== */}
      {/* AGENT TABLE */}
      {/* ================================== */}

      <div className="min-w-0">

        <div className="overflow-x-auto">

          <table className="
            w-full
            min-w-[850px]
            border-collapse
            text-sm
          ">

            {/* Table header */}
            <thead>
              <tr className="
                border-b
                border-[#DDE4EF]
                text-[#52627E]
              ">

                <th className="
                  w-[34%]
                  px-2
                  pb-4
                  pt-1
                  text-left
                  text-[14px]
                  font-bold
                ">
                  Agent
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  Calls
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  Connected
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  Missed
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  Clients
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  Talk
                </th>

                <th className="px-3 pb-4 pt-1 text-center text-[14px] font-bold">
                  <span className="inline-flex items-center gap-1">
                    Rate
                    <span className="text-[#F58220] text-[13px]">
                      ▼
                    </span>
                  </span>
                </th>

              </tr>
            </thead>

            {/* Table body */}
            <tbody>

              {agents.length === 0 ? (

                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">

                    <div className="
                      mx-auto flex h-12 w-12
                      items-center justify-center
                      rounded-2xl bg-[#E9EFF9]
                      text-[#376BB5]
                    ">
                      <Headphones size={24} />
                    </div>

                    <p className="mt-3 text-[15px] font-semibold text-[#0A2E66]">
                      No calls recorded today
                    </p>

                    <p className="mt-1 text-[13px] text-[#8491A8]">
                      Agent call activity will appear here when available.
                    </p>

                  </td>
                </tr>

              ) : (

                agents.map((agent, index) => {

                  const rate = Number(agent.connectRate) || 0;

                  const agentName = agent.agentName || "Unknown";

                  const initials = agentName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  const avatarColors = [
                    "bg-[#2C528B]",
                    "bg-[#0F7894]",
                    "bg-[#7050A8]",
                    "bg-[#16865D]",
                  ];

                  return (

                    <tr
                      key={agent.agentErpUserId}
                      className="
                        border-b
                        border-[#DDE4EF]
                        transition-colors duration-200
                        hover:bg-[#F7F9FD]
                        last:border-b-0
                      "
                    >

                      {/* Agent profile */}
                      <td className="px-2 py-[19px]">

                        <div className="flex min-w-0 items-center gap-3.5">

                          {/* Avatar */}
                          <div className={`
                            flex h-[48px] w-[48px]
                            shrink-0 items-center
                            justify-center
                            rounded-full
                            text-[16px]
                            font-bold
                            text-white
                            ${avatarColors[index % avatarColors.length]}
                          `}>
                            {initials || <Users size={20} />}
                          </div>

                          {/* Agent details */}
                          <div className="min-w-0">

                            <p className="
                              max-w-[220px]
                              truncate
                              text-[16px]
                              font-semibold
                              text-[#0F1B33]
                            ">
                              {agentName}
                            </p>

                            <p className="
                              mt-1
                              max-w-[220px]
                              truncate
                              text-[14px]
                              font-normal
                              text-[#64748B]
                            ">
                              {agent.agentEmail || "—"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Total calls */}
                      <td className="
                        px-3 py-5
                        text-center
                        text-[16px]
                        font-semibold
                        tabular-nums
                        text-[#0F1B33]
                      ">
                        {agent.totalCalls ?? 0}
                      </td>

                      {/* Connected */}
                      <td className="
                        px-3 py-5
                        text-center
                        text-[16px]
                        font-bold
                        tabular-nums
                        text-[#16865D]
                      ">
                        {agent.connectedCalls ?? 0}
                      </td>

                      {/* Missed */}
                      <td className="
                        px-3 py-5
                        text-center
                        text-[16px]
                        font-semibold
                        tabular-nums
                        text-[#E53935]
                      ">
                        {agent.missedCalls ?? 0}
                      </td>

                      {/* Clients */}
                      <td className="
                        px-3 py-5
                        text-center
                        text-[16px]
                        font-medium
                        tabular-nums
                        text-[#0F1B33]
                      ">
                        {agent.uniqueCustomerCount ?? 0}
                      </td>

                      {/* Talk time */}
                      <td className="
                        px-3 py-5
                        text-center
                        text-[16px]
                        font-medium
                        tabular-nums
                        text-[#0F1B33]
                      ">
                        {agent.totalTalkMinutes ?? 0}m
                      </td>

                      {/* Rate progress */}
                      <td className="px-3 py-5">

                        <RateBadge rate={rate} />

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* Mobile scrolling hint */}
        {agents.length > 0 && (
          <p className="mt-3 text-[11px] text-[#8491A8] sm:hidden">
            Swipe horizontally to view all call statistics.
          </p>
        )}

      </div>

    </section>
  );
};


// ========================================
// SUMMARY TILE
// ========================================

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "blue",
}) {

  const tones = {
    emerald: {
      bg: "bg-[#E5F5EC]",
      color: "text-[#16865D]",
    },

    red: {
      bg: "bg-[#FCEAE9]",
      color: "text-[#E53935]",
    },

    purple: {
      bg: "bg-[#F0EBFC]",
      color: "text-[#7050E8]",
    },

    blue: {
      bg: "bg-[#E9EFF9]",
      color: "text-[#376BB5]",
    },
  };

  const style = tones[tone] || tones.blue;

  return (

    <div className={`
      flex min-w-0
      min-h-[104px]
      flex-col justify-between
      rounded-[21px]
      p-4
      transition-transform duration-200
      hover:-translate-y-0.5
      sm:p-5
      ${style.bg}
    `}>

      {/* Label and icon */}
      <div className={`
        flex items-center gap-2
        ${style.color}
      `}>

        <Icon
          size={19}
          strokeWidth={2}
          className="shrink-0"
        />

        <span className="
          truncate
          text-[14px]
          font-semibold
          sm:text-[15px]
        ">
          {label}
        </span>

      </div>

      {/* Value */}
      <p className={`
        mt-2
        text-[29px]
        font-bold
        leading-none
        tracking-tight
        tabular-nums
        sm:text-[34px]
        ${style.color}
      `}>
        {value}
      </p>

    </div>
  );
}


// ========================================
// RATE PROGRESS BAR
// ========================================

function RateBadge({ rate }) {

  return (

    <div className="
      flex min-w-[145px]
      items-center gap-3
      px-1
    ">

      {/* Progress track */}
      <div className="
        h-[10px]
        min-w-[60px]
        flex-1
        overflow-hidden
        rounded-full
        bg-[#FCEAE9]
      ">

        <div
          className="
            h-full
            rounded-full
            bg-[#16865D]
            transition-all duration-500
          "
          style={{
            width: `${Math.min(100, Math.max(0, rate))}%`,
          }}
        />

      </div>

      {/* Percentage */}
      <span className="
        min-w-[40px]
        text-right
        text-[15px]
        font-bold
        tabular-nums
        text-[#0F1B33]
      ">
        {rate}%
      </span>

    </div>
  );
}

export default Callinfo;
