// components/sales-dashboard/dashboard-cards/DailyCall.jsx

"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallStatsService } from "@/service/sales-dashboard/dashboard-api";
import axios from "axios";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Users,
  Clock,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  MessageCircle,
} from "lucide-react";
import CurrentMonthDealValue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthDealValue";
import CurrentMonthRevenue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthRevenue";
import TotalClientCount from "@/components/sales-dashboard/dashboard-cards/TotalClientCount";

// ========================================
// KPI CARD COMPONENT
// ========================================
const StatCard = ({ title, value, icon: Icon, color, background, className = "", suffix = "" }) => {
  return (
    <div
      className={`group/stat relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-[22px] border border-slate-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(10,46,102,0.08)] sm:p-5 ${className}`}
      style={{ backgroundColor: background }}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-xl transition-all duration-300 group-hover/stat:scale-125" style={{ backgroundColor: color }} />
      
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: "#475569" }}>
          {title}
        </p>
        <div className="flex h-9 w-9 shrink-0 items-center.flex items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover/stat:scale-110" style={{ color, backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>
      
      <p className="relative z-15 text-[28px] font-bold leading-none tracking-tight sm:text-[32px]" style={{ color: "#0A2E66" }}>
        {value}
        {suffix && <span className="ml-1 text-base font-medium text-slate-500">{suffix}</span>}
      </p>
    </div>
  );
};

// ========================================
// RECENT CALL ITEM COMPONENT
// ========================================
const RecentCallItem = ({ call }) => {
  const name = call.customerName || "Unknown Client";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isMissed = ["missed", "failed", "busy", "cancelled"].includes(call.status);
  const isConnected = call.connected;

  return (
    <div className="group/item flex items-center justify-between border-b border-slate-100 py-3.5 px-3 transition-all duration-200 last:border-0 hover:bg-slate-50/80 hover:rounded-2xl">
      {/* Left Side: Avatar & Details */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2E66] to-[#1c4b94] text-xs font-bold text-white shadow-sm shadow-blue-900/10">
          {initials}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[14px] font-semibold text-slate-900 group-hover/item:text-[#0A2E66] transition-colors">{name}</h4>
            {call.customerCompany && (
              <span className="text-xs font-medium text-slate-400">· {call.customerCompany}</span>
            )}
          </div>
          
          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>{call.customerPhone || call.toNumber}</span>
            <span>•</span>
            <span>{isConnected ? "Connected" : call.status || "Follow-up"}</span>
          </div>

          {/* Status Badge */}
          <div className="mt-2">
            {isMissed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-100/50">
                <PhoneMissed size={11} />
                Missed call
              </span>
            ) : isConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-100/50">
                <PhoneCall size={11} />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 border border-amber-100/50">
                <Clock size={11} />
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Action Buttons */}
      <div className="flex items-center gap-2 opacity-90 transition-opacity group-hover/item:opacity-100">
        <button 
          title="Call client" 
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
        >
          <Phone size={16} />
        </button>
        <button 
          title="Send message" 
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0A2E66] hover:bg-[#0A2E66] hover:text-white transition-all shadow-sm"
        >
          <MessageCircle size={16} />
        </button>
        <button className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#0A2E66] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#153f80] transition-all shadow-sm">
          Log call
        </button>
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
const DailyCall = () => {
  const { employee } = useSalesEmployeeStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);

  async function fetchData() {
    try {
      setLoading(true);
      
      const statsRes = await dailyCallStatsService(employee?.user?._id);
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      const historyRes = await axios.get(`/api/calling/history?scope=self&limit=5`);
      if (historyRes.data.success) {
        setRecentCalls(historyRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching daily call data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchData();
    }
  }, [employee?.user?._id]);

  if (loading) {
    return (
      <section className="w-full rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(10,46,102,0.04)] sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <Skeleton width={52} height={52} borderRadius={18} />
          <div className="flex-1">
            <Skeleton width={180} height={26} />
            <div className="mt-2"><Skeleton width={120} height={16} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height={110} borderRadius={22} />
          ))}
        </div>
        <div className="mt-6"><Skeleton height={75} borderRadius={20} /></div>
      </section>
    );
  }

  const s = stats || {};
  const totalCalls = s.totalCalls || 0;
  const connectedCalls = s.connectedCalls || 0;
  const missedCalls = s.missedCalls || 0;
  const uniqueCustomerCount = s.uniqueCustomerCount || 0;
  const totalTalkMinutes = s.totalTalkMinutes || 0;
  const connectRate = s.connectRate || 0;
  const inboundCalls = s.inboundCalls || 0;
  const outboundCalls = s.outboundCalls || 0;

  const getCallInsight = () => {
    if (totalCalls === 0) return "You haven't logged any calls today. Start connecting with your active client pipeline to drive conversions.";
    if (connectRate >= 70) return <>Your connect rate is <strong className="font-bold text-[#0A2E66]">{connectRate}%</strong>. Exceptional performance! Keep up the momentum.</>;
    if (connectRate >= 40) return <>Your connect rate is <strong className="font-bold text-[#0A2E66]">{connectRate}%</strong>. Consistent follow-ups will help boost your performance further.</>;
    return <>Your connect rate is <strong className="font-bold text-[#0A2E66]">{connectRate}%</strong>. Consider optimizing your call timings for better engagement.</>;
  };

  return (
    <section className="group/card w-full min-w-0 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(10,46,102,0.04)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(10,46,102,0.08)] sm:p-8">
      
      {/* HEADER */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-50 to-orange-50 text-[#0A2E66] shadow-sm transition-transform duration-300 group-hover/card:scale-105">
            <TrendingUp size={26} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="font-serif text-[22px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[26px]">
              My Calls Today
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              {totalCalls} total calls logged today
            </p>
          </div>
        </div>

        {/* Live Indicator Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 border border-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Pipeline Active</span>
        </div>
      </div>

      {/* KPI GRID SECTION */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Side: Call Metrics */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <StatCard title="Connected" value={connectedCalls} icon={PhoneCall} color="#10B981" background="#F0FDF4" />
          <StatCard title="Missed" value={missedCalls} icon={PhoneMissed} color="#EF4444" background="#FEF2F2" />
          <StatCard title="Clients" value={uniqueCustomerCount} icon={Users} color="#0A2E66" background="#F8FAFC" />
          <StatCard title="Talk Time" value={totalTalkMinutes} suffix="m" icon={Clock} color="#8B5CF6" background="#F5F3FF" />
        </div>

        {/* Right Side: Financial & Deal Widgets */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <CurrentMonthDealValue />
          <CurrentMonthRevenue />
          <div className="col-span-2">
            <TotalClientCount />
          </div>
        </div>
      </div>

      {/* INSIGHT BANNER */}
      <div className="mt-5 flex min-h-[70px] items-center rounded-[20px] bg-slate-50/80 px-5 py-4 border border-slate-100">
        <p className="text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
          {getCallInsight()}
        </p>
      </div>

      {/* RECENT CALLS LIST */}
      {recentCalls.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-slate-900">Recent Calls Activity</h3>
            <span className="text-xs font-semibold text-[#F27B1E]">Latest 5 updates</span>
          </div>
          <div className="flex flex-col gap-1">
            {recentCalls.map((call) => (
              <RecentCallItem key={call._id} call={call} />
            ))}
          </div>
        </div>
      )}

      {/* INBOUND / OUTBOUND SUMMARY FOOTER */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm">
            <ArrowDown size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inbound Calls</p>
            <p className="text-lg font-bold text-slate-900 sm:text-xl">{inboundCalls}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm">
            <ArrowUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Outbound Calls</p>
            <p className="text-lg font-bold text-slate-900 sm:text-xl">{outboundCalls}</p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default DailyCall;
