// components/admin-dashboard/dashboard/Callinfo.jsx
"use client";

import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Users,
  Clock,
  TrendingUp,
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
      if (res.success) {
        setData(res.data || { agents: [], totals: null });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load call info");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    // refresh every 60s while page is open
    const t = setInterval(fetchStats, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <Skeleton height={24} width={200} className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Skeleton height={70} />
          <Skeleton height={70} />
          <Skeleton height={70} />
          <Skeleton height={70} />
        </div>
        <Skeleton height={50} count={3} className="mb-2" />
      </div>
    );
  }

  const { agents = [], totals } = data;

  return (
    <div className="w-full min-w-0 bg-white rounded-lg shadow-md p-6 mb-8 border border-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Team Call Activity — Today
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Live overview of every agent's calls for today
          </p>
        </div>
        <Link
          href="/dashboard/calling"
          className="text-sm text-blue-600 hover:underline font-medium whitespace-nowrap"
        >
          View all logs →
        </Link>
      </div>

      {/* Summary tiles */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryTile
            icon={<PhoneCall className="h-4 w-4" />}
            label="Connected"
            value={totals.connectedCalls}
            tone="emerald"
          />
          <SummaryTile
            icon={<PhoneMissed className="h-4 w-4" />}
            label="Missed"
            value={totals.missedCalls}
            tone="red"
          />
          <SummaryTile
            icon={<Clock className="h-4 w-4" />}
            label="Talk Time"
            value={`${totals.totalTalkMinutes || 0}m`}
            tone="purple"
          />
          <SummaryTile
            icon={<TrendingUp className="h-4 w-4" />}
            label="Connect Rate"
            value={`${totals.connectRate || 0}%`}
            tone="blue"
          />
        </div>
      )}

      {/* Agents table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Agent
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Connected
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Missed
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Clients
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Talk Time
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {agents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No calls today yet.
                </td>
              </tr>
            ) : (
              agents.map((a) => (
                <tr
                  key={a.agentErpUserId}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {a.agentName || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {a.agentEmail || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">
                    {a.totalCalls}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-emerald-600">
                    {a.connectedCalls}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-red-500">
                    {a.missedCalls}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-700">
                    {a.uniqueCustomerCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-700">
                    {a.totalTalkMinutes}m
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        a.connectRate >= 60
                          ? "bg-emerald-50 text-emerald-700"
                          : a.connectRate >= 30
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {a.connectRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- tiny summary tile ----
function SummaryTile({ icon, label, value, tone = "blue" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`rounded-lg p-3 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default Callinfo;