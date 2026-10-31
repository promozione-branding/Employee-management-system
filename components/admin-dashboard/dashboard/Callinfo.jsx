
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
  Activity,
  Headphones,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAdminDailyCallStatsService } from "@/service/calling";
import Link from "next/link";

const Callinfo = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ agents: [], totals: null });

  async function fetchStats() {
    try {
      const res = await getAdminDailyCallStatsService();

      if (res?.success) {
        setData(res.data || { agents: [], totals: null });
      }
    } catch (err) {
      console.error("Failed to load call statistics:", err);
      toast.error(err?.message || "Failed to load call info");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();

    const intervalId = setInterval(fetchStats, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton height={44} width={44} borderRadius={12} />
          <div>
            <Skeleton height={20} width={210} />
            <Skeleton height={14} width={250} />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={88} borderRadius={14} />
          ))}
        </div>

        <Skeleton height={42} className="mb-2" />
        <Skeleton height={52} count={3} className="mb-1" />
      </section>
    );
  }

  const { agents = [], totals } = data;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 lg:p-6">
      {/* Section heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2E66]">
            <Phone size={21} strokeWidth={1.9} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-[#0A2E66] sm:text-xl">
                Team Call Activity
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Today
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Overview of every agent&apos;s calls for today
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/calling"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-blue-100 px-3.5 py-2.5 text-sm font-semibold text-[#0A2E66] transition-colors hover:border-blue-200 hover:bg-blue-50"
        >
          View all logs
          <ArrowUpRight size={16} className="text-[#F27B1E]" />
        </Link>
      </div>

      {/* Summary tiles */}
      {totals && (
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
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

      {/* Table heading */}
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          Agent performance
        </h3>

        <p className="text-xs text-slate-500">
          {agents.length} {agents.length === 1 ? "agent" : "agents"}
        </p>
      </div>

      {/* Responsive table */}
      <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[760px] divide-y divide-slate-100 text-sm">
          <thead className="bg-[#F2F4F9]">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Agent
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Connected
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Missed
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Clients
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Talk time
              </th>

              <th scope="col" className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Rate
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0A2E66]">
                    <Headphones size={21} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No calls recorded today
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Agent call activity will appear here when available.
                  </p>
                </td>
              </tr>
            ) : (
              agents.map((agent) => {
                const rate = Number(agent.connectRate) || 0;

                return (
                  <tr
                    key={agent.agentErpUserId}
                    className="transition-colors hover:bg-blue-50/40"
                  >
                    {/* Agent */}
                    <td className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2E66]">
                          <Users size={17} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-sm font-semibold text-slate-800">
                            {agent.agentName || "Unknown"}
                          </p>

                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-500">
                            {agent.agentEmail || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold tabular-nums text-slate-800">
                      {agent.totalCalls ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold tabular-nums text-emerald-700">
                      {agent.connectedCalls ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold tabular-nums text-red-600">
                      {agent.missedCalls ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-center tabular-nums text-slate-700">
                      {agent.uniqueCustomerCount ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-center tabular-nums text-slate-700">
                      {agent.totalTalkMinutes ?? 0}m
                    </td>

                    <td className="px-4 py-3.5 text-center">
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
        <p className="mt-2 text-[11px] text-slate-400 sm:hidden">
          Swipe horizontally to view all call statistics.
        </p>
      )}
    </section>
  );
};

function SummaryTile({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50/70",
      icon: "bg-white text-emerald-700",
      label: "text-emerald-800",
      value: "text-emerald-950",
    },
    red: {
      wrapper: "border-red-100 bg-red-50/70",
      icon: "bg-white text-red-600",
      label: "text-red-700",
      value: "text-red-950",
    },
    purple: {
      wrapper: "border-violet-100 bg-violet-50/70",
      icon: "bg-white text-violet-700",
      label: "text-violet-700",
      value: "text-violet-950",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50/70",
      icon: "bg-white text-[#0A2E66]",
      label: "text-blue-800",
      value: "text-[#0A2E66]",
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <div className={`min-w-0 rounded-xl border p-3 transition-colors sm:p-4 ${style.wrapper}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${style.icon}`}>
          <Icon size={16} strokeWidth={2} />
        </span>

        <span className={`truncate text-[10px] font-bold uppercase tracking-wide sm:text-xs ${style.label}`}>
          {label}
        </span>
      </div>

      <p className={`mt-3 text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${style.value}`}>
        {value}
      </p>
    </div>
  );
}

function RateBadge({ rate }) {
  const style =
    rate >= 60
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : rate >= 30
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-red-100 bg-red-50 text-red-700";

  return (
    <span className={`inline-flex min-w-[58px] items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-bold tabular-nums ${style}`}>
      {rate}%
    </span>
  );
}

export default Callinfo;
