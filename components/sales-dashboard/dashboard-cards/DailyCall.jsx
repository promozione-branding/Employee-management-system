"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallStatsService } from "@/service/sales-dashboard/dashboard-api";
import axios from "axios"; // Make sure to import axios or your fetch wrapper

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
  PhoneOutgoing,
  PhoneIncoming,
  MessageCircle,
} from "lucide-react";

// ========================================
// KPI CARD COMPONENT
// ========================================
const StatCard = ({ title, value, icon: Icon, color, background, className = "", suffix = "" }) => {
  return (
    <div
      className={`group flex min-h-[103px] flex-col justify-between rounded-[20px] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,27,51,0.06)] sm:p-5 ${className}`}
      style={{ backgroundColor: background }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ color }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <p className="text-[13px] font-bold sm:text-sm" style={{ color }}>
          {title}
        </p>
      </div>
      <p className="pl-1 text-[30px] font-bold leading-none tracking-tight sm:text-[34px]" style={{ color }}>
        {value}
        {suffix && <span className="ml-1 text-lg font-semibold">{suffix}</span>}
      </p>
    </div>
  );
};

// ========================================
// RECENT CALL ITEM COMPONENT
// ========================================
const RecentCallItem = ({ call }) => {
  // Get initials for avatar
  const name = call.customerName || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isMissed = ["missed", "failed", "busy", "cancelled"].includes(call.status);
  const isConnected = call.connected;

  return (
    <div className="flex items-center justify-between border-b border-[#E9EDF4] py-4 last:border-0 hover:bg-[#F9FAFD] px-2 rounded-lg transition-colors">
      
      {/* Left Side: Avatar & Details */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-sm font-bold text-white">
          {initials}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[15px] font-bold text-[#0F1B33]">{name}</h4>
            {call.customerCompany && (
              <span className="text-sm text-[#64748B]">· {call.customerCompany}</span>
            )}
          </div>
          
          <div className="mt-1 flex items-center gap-2 text-sm text-[#64748B]">
            <span>{call.customerPhone || call.toNumber}</span>
            {isConnected && <span className="text-xs">· Connected</span>}
            {!isConnected && <span className="text-xs">· {call.status}</span>}
          </div>

          {/* Status Badge */}
          <div className="mt-2">
            {isMissed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FCEAE8] px-2.5 py-1 text-xs font-semibold text-[#E23B35]">
                <PhoneMissed size={12} />
                Missed your call
              </span>
            ) : isConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F5EC] px-2.5 py-1 text-xs font-semibold text-[#16865D]">
                <PhoneCall size={12} />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4D9] px-2.5 py-1 text-xs font-semibold text-[#B86A00]">
                <Clock size={12} />
                Follow-up due
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16865D] text-white hover:bg-[#126D4A] transition">
          <Phone size={18} />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F5EC] text-[#16865D] hover:bg-[#D1EADF] transition">
          <MessageCircle size={18} />
        </button>
        <button className="flex h-10 items-center justify-center rounded-lg bg-[#0F1B33] px-4 text-sm font-semibold text-white hover:bg-[#1A2B4C] transition">
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

  // ========================================
  // FETCH DATA (STATS + HISTORY)
  // ========================================
  async function fetchData() {
    try {
      setLoading(true);
      
      // 1. Fetch Stats
      const statsRes = await dailyCallStatsService(employee?.user?._id);
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // 2. Fetch Recent Calls History
      // We pass scope=self to get only this agent's calls
      const historyRes = await axios.get(`/api/calling/history?scope=self&limit=5`);
      if (historyRes.data.success) {
        setRecentCalls(historyRes.data.data);
      }

    } catch (error) {
      console.log(error);
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

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <section className="w-full rounded-[24px] border border-[#E1E7F0] bg-white p-5 shadow-[0_4px_18px_rgba(10,46,102,0.05)] sm:p-7">
        <div className="mb-7 flex items-center gap-4">
          <Skeleton width={50} height={50} borderRadius={16} />
          <div className="flex-1">
            <Skeleton width={180} height={25} />
            <div className="mt-2"><Skeleton width={120} height={16} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height={103} borderRadius={20} />
          ))}
        </div>
        <div className="mt-5"><Skeleton height={75} borderRadius={16} /></div>
        <div className="mt-6 flex justify-between">
          <Skeleton width={130} height={25} />
          <Skeleton width={130} height={25} />
        </div>
      </section>
    );
  }

  // ========================================
  // DATA MAPPING
  // ========================================
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
    if (totalCalls === 0) return "You haven't made any calls today. Start connecting with your customers to build stronger relationships.";
    if (connectRate >= 70) return <>Your connect rate is <strong className="font-bold text-[#0F1B33]">{connectRate}%</strong>. Excellent work! Keep maintaining your strong customer connections.</>;
    if (connectRate >= 40) return <>Your connect rate is <strong className="font-bold text-[#0F1B33]">{connectRate}%</strong>. Keep following up with your customers to improve your results.</>;
    return <>Your connect rate is <strong className="font-bold text-[#0F1B33]">{connectRate}%</strong>. Focus on follow-ups and try reaching customers at better times.</>;
  };

  return (
    <section className="group/card w-full min-w-0 overflow-hidden rounded-[24px] border border-[#E1E7F0] bg-white p-5 shadow-[0_4px_18px_rgba(10,46,102,0.05)] transition-all duration-300 hover:shadow-[0_8px_28px_rgba(10,46,102,0.08)] sm:p-7 lg:p-7">
      
      {/* HEADER */}
      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] bg-[#E9EFF9] text-[#376BB5] transition-transform duration-300 group-hover/card:scale-105">
          <TrendingUp size={25} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-[22px] font-bold leading-tight tracking-tight text-[#0F1B33] sm:text-[25px]">
            My calls today
          </h2>
          <p className="mt-1 text-[15px] font-normal text-[#64748B] sm:text-base">
            {totalCalls} calls so far
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        <StatCard title="Connected" value={connectedCalls} icon={PhoneCall} color="#16865D" background="#E5F5EC" />
        <StatCard title="Missed" value={missedCalls} icon={PhoneMissed} color="#E23B35" background="#FCEAE8" />
        <StatCard title="Clients" value={uniqueCustomerCount} icon={Users} color="#376BB5" background="#E9EFF9" />
        <StatCard title="Talk time" value={totalTalkMinutes} suffix="m" icon={Clock} color="#7050E8" background="#EFEBFC" />
      </div>

      {/* CONNECT RATE INSIGHT */}
      <div className="mt-5 flex min-h-[75px] items-center rounded-[17px] bg-[#F5F7FC] px-4 py-4 sm:px-5">
        <p className="text-[13px] leading-6 text-[#64748B] sm:text-[14px] sm:leading-7">
          {getCallInsight()}
        </p>
      </div>

      {/* RECENT CALLS LIST */}
      {recentCalls.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-[16px] font-bold text-[#0F1B33]">Recent Calls</h3>
          <div className="flex flex-col">
            {recentCalls.map((call) => (
              <RecentCallItem key={call._id} call={call} />
            ))}
          </div>
        </div>
      )}

      {/* INBOUND / OUTBOUND FOOTER */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E9EDF4] pt-5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5F5EC] text-[#16865D]">
            <ArrowDown size={21} strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="truncate text-[12px] text-[#64748B] sm:text-sm">Inbound:</span>
            <span className="text-lg font-bold text-[#0F1B33] sm:text-[22px]">{inboundCalls}</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FCEAE8] text-[#E23B35]">
            <ArrowUp size={21} strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="truncate text-[12px] text-[#64748B] sm:text-sm">Outbound:</span>
            <span className="text-lg font-bold text-[#0F1B33] sm:text-[22px]">{outboundCalls}</span>
          </div>
        </div>
      </div>

    </section>
  );
};

export default DailyCall;