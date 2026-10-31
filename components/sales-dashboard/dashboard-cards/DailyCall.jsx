
"use client";

// components/sales-dashboard/dashboard-cards/DailyCall.jsx

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
  TrendingUp,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

// ========================================
// KPI CARD COMPONENT
// ========================================

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  background,
  className = "",
  suffix = "",
}) => {
  return (
    <div
      className={`
        group
        flex
        min-h-[103px]
        flex-col
        justify-between
        rounded-[20px]
        p-4
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_8px_20px_rgba(15,27,51,0.06)]
        sm:p-5
        ${className}
      `}
      style={{ backgroundColor: background }}
    >
      {/* Label */}

      <div className="flex items-center gap-2.5">

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ color }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        <p
          className="text-[13px] font-bold sm:text-sm"
          style={{ color }}
        >
          {title}
        </p>

      </div>

      {/* Value */}

      <p
        className="
          pl-1
          text-[30px]
          font-bold
          leading-none
          tracking-tight
          sm:text-[34px]
        "
        style={{ color }}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-lg font-semibold">
            {suffix}
          </span>
        )}
      </p>

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

  // ========================================
  // FETCH DAILY CALL STATS
  // ========================================

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
      setLoading(true);
      fetchDailyCallStats();
    }
  }, [employee?.user?._id]);

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <section
        className="
          w-full
          rounded-[24px]
          border
          border-[#E1E7F0]
          bg-white
          p-5
          shadow-[0_4px_18px_rgba(10,46,102,0.05)]
          sm:p-7
        "
      >
        <div className="mb-7 flex items-center gap-4">
          <Skeleton
            width={50}
            height={50}
            borderRadius={16}
          />

          <div className="flex-1">
            <Skeleton width={180} height={25} />
            <div className="mt-2">
              <Skeleton width={120} height={16} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              height={103}
              borderRadius={20}
            />
          ))}
        </div>

        <div className="mt-5">
          <Skeleton height={75} borderRadius={16} />
        </div>

        <div className="mt-6 flex justify-between">
          <Skeleton width={130} height={25} />
          <Skeleton width={130} height={25} />
        </div>
      </section>
    );
  }

  // ========================================
  // STATISTICS
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

  // ========================================
  // DYNAMIC INSIGHT
  // ========================================

  const getCallInsight = () => {
    if (totalCalls === 0) {
      return (
        <>
          You haven't made any calls today. Start connecting with your
          customers to build stronger relationships.
        </>
      );
    }

    if (connectRate >= 70) {
      return (
        <>
          Your connect rate is{" "}
          <strong className="font-bold text-[#0F1B33]">
            {connectRate}%
          </strong>
          . Excellent work! Keep maintaining your strong customer
          connections.
        </>
      );
    }

    if (connectRate >= 40) {
      return (
        <>
          Your connect rate is{" "}
          <strong className="font-bold text-[#0F1B33]">
            {connectRate}%
          </strong>
          . Keep following up with your customers to improve your results.
        </>
      );
    }

    return (
      <>
        Your connect rate is{" "}
        <strong className="font-bold text-[#0F1B33]">
          {connectRate}%
        </strong>
        . Focus on follow-ups and try reaching customers at better times.
      </>
    );
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <section
      className="
        group/card
        w-full
        min-w-0
        overflow-hidden
        rounded-[24px]
        border
        border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_4px_18px_rgba(10,46,102,0.05)]
        transition-all
        duration-300
        hover:shadow-[0_8px_28px_rgba(10,46,102,0.08)]
        sm:p-7
        lg:p-7
      "
    >

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-7 flex items-center gap-4">

        {/* Header Icon */}

        <div
          className="
            flex
            h-[50px] w-[50px]
            shrink-0
            items-center
            justify-center
            rounded-[16px]
            bg-[#E9EFF9]
            text-[#376BB5]
            transition-transform
            duration-300
            group-hover/card:scale-105
          "
        >
          <TrendingUp
            size={25}
            strokeWidth={2}
          />
        </div>

        {/* Heading */}

        <div className="min-w-0">

          <h2
            className="
              font-serif
              text-[22px]
              font-bold
              leading-tight
              tracking-tight
              text-[#0F1B33]
              sm:text-[25px]
            "
          >
            My calls today
          </h2>

          <p
            className="
              mt-1
              text-[15px]
              font-normal
              text-[#64748B]
              sm:text-base
            "
          >
            {totalCalls} calls so far
          </p>

        </div>

      </div>

      {/* ================================== */}
      {/* KPI GRID */}
      {/* ================================== */}

      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">

        {/* Connected */}

        <StatCard
          title="Connected"
          value={connectedCalls}
          icon={PhoneCall}
          color="#16865D"
          background="#E5F5EC"
        />

        {/* Missed */}

        <StatCard
          title="Missed"
          value={missedCalls}
          icon={PhoneMissed}
          color="#E23B35"
          background="#FCEAE8"
        />

        {/* Unique Customers */}

        <StatCard
          title="Clients"
          value={uniqueCustomerCount}
          icon={Users}
          color="#376BB5"
          background="#E9EFF9"
        />

        {/* Talk Time */}

        <StatCard
          title="Talk time"
          value={totalTalkMinutes}
          suffix="m"
          icon={Clock}
          color="#7050E8"
          background="#EFEBFC"
        />

      </div>

      {/* ================================== */}
      {/* CONNECT RATE INSIGHT */}
      {/* ================================== */}

      <div
        className="
          mt-5
          flex
          min-h-[75px]
          items-center
          rounded-[17px]
          bg-[#F5F7FC]
          px-4
          py-4
          sm:px-5
        "
      >

        <p
          className="
            text-[13px]
            leading-6
            text-[#64748B]
            sm:text-[14px]
            sm:leading-7
          "
        >
          {getCallInsight()}
        </p>

      </div>

      {/* ================================== */}
      {/* INBOUND / OUTBOUND FOOTER */}
      {/* ================================== */}

      <div
        className="
          mt-6
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-[#E9EDF4]
          pt-5
        "
      >

        {/* Inbound */}

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

          <div
            className="
              flex
              h-9 w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#E5F5EC]
              text-[#16865D]
            "
          >
            <ArrowDown size={21} strokeWidth={2.5} />
          </div>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

            <span className="truncate text-[12px] text-[#64748B] sm:text-sm">
              Inbound:
            </span>

            <span className="text-lg font-bold text-[#0F1B33] sm:text-[22px]">
              {inboundCalls}
            </span>

          </div>

        </div>

        {/* Outbound */}

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

          <div
            className="
              flex
              h-9 w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#FCEAE8]
              text-[#E23B35]
            "
          >
            <ArrowUp size={21} strokeWidth={2.5} />
          </div>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

            <span className="truncate text-[12px] text-[#64748B] sm:text-sm">
              Outbound:
            </span>

            <span className="text-lg font-bold text-[#0F1B33] sm:text-[22px]">
              {outboundCalls}
            </span>

          </div>

        </div>

      </div>

    </section>
  );
};

export default DailyCall;
