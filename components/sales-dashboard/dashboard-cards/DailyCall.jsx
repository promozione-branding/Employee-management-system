// components/sales-dashboard/dashboard-cards/DailyCall.jsx
"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { dailyCallStatsService } from "@/service/sales-dashboard/dashboard-api";
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
} from "lucide-react";

const DailyCall = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  async function fetchDailyCallStats() {
    try {
      const res = await dailyCallStatsService(employee?.user?._id);
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching daily call stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employee?.user?._id) {
      fetchDailyCallStats();
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="mb-5 bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full">
        <Skeleton height={20} width={140} className="mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full h-full hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Today's Calls
          </p>
          <p className="text-xs text-gray-400">
            {s.totalCalls || 0} total · {s.connectRate || 0}% connected
          </p>
        </div>
        <div className="p-2 bg-orange-50 rounded-full">
          <Phone className="h-5 w-5 text-orange-600" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Connected */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50">
          <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-emerald-700 font-medium leading-tight">
              Connected
            </p>
            <p className="text-lg font-bold text-emerald-800 leading-tight">
              {s.connectedCalls || 0}
            </p>
          </div>
        </div>

        {/* Missed */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-red-50">
          <PhoneMissed className="h-4 w-4 text-red-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-red-700 font-medium leading-tight">
              Missed
            </p>
            <p className="text-lg font-bold text-red-800 leading-tight">
              {s.missedCalls || 0}
            </p>
          </div>
        </div>

        {/* Unique customers */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50">
          <Users className="h-4 w-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-blue-700 font-medium leading-tight">
              Clients
            </p>
            <p className="text-lg font-bold text-blue-800 leading-tight">
              {s.uniqueCustomerCount || 0}
            </p>
          </div>
        </div>

        {/* Talk time */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-purple-50">
          <Clock className="h-4 w-4 text-purple-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-purple-700 font-medium leading-tight">
              Talk Time
            </p>
            <p className="text-lg font-bold text-purple-800 leading-tight">
              {s.totalTalkMinutes || 0}
              <span className="text-xs font-medium ml-0.5">m</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer: inbound/outbound split */}
      <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between text-[11px] text-gray-500">
        <span>↓ Inbound: <b className="text-gray-700">{s.inboundCalls || 0}</b></span>
        <span>↑ Outbound: <b className="text-gray-700">{s.outboundCalls || 0}</b></span>
      </div>
    </div>
  );
};

export default DailyCall;