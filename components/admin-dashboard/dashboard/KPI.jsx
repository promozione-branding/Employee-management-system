
"use client";

import {
  allClientCountService,
  allEmployeeService,
  currentMonthDealValueService,
  currentMonthRevenueService,
} from "@/service/admin-dashboard/dashboard-api";

import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  IdCardLanyard,
  IndianRupee,
  Users,
} from "lucide-react";

import Link from "next/link";
import React, { useEffect, useState } from "react";

// ========================================
// KPI CARD CONFIGURATION
// ========================================

const KPI_CARDS = [
  {
    title: "Month deal value",
    icon: IndianRupee,
    iconColor: "#376BB5",
    iconBg: "#E9EFF9",
    trend: "+12.5%",
    trendType: "up",
    chartColor: "#376BB5",
    chartPath:
      "M0 45 L32 31 L64 39 L96 42 L128 24 L160 17 L192 28 L224 23 L256 5 L288 5 L320 14 L352 2",
    key: "dealValue",
    getValue: (data) =>
      `₹${data.dealValue.toLocaleString("en-IN")}`,
  },
  {
    title: "Total customers",
    icon: Users,
    iconColor: "#13875C",
    iconBg: "#E5F5EC",
    trend: "+8.2%",
    trendType: "up",
    chartColor: "#13875C",
    chartPath:
      "M0 40 L32 36 L64 45 L96 37 L128 21 L160 24 L192 32 L224 19 L256 7 L288 14 L320 16 L352 0",
    key: "clientCount",
    getValue: (data) =>
      data.clientCount.toLocaleString("en-IN"),
    href: "/dashboard/customer",
  },
  {
    title: "Month revenue",
    icon: FileText,
    iconColor: "#7050E8",
    iconBg: "#EFEBFC",
    trend: "+3.1%",
    trendType: "up",
    chartColor: "#7050E8",
    chartPath:
      "M0 36 L32 40 L64 45 L96 32 L128 23 L160 31 L192 30 L224 14 L256 11 L288 20 L320 12 L352 0",
    key: "revenue",
    getValue: (data) =>
      `₹${data.revenue.toLocaleString("en-IN")}`,
  },
  {
    title: "Total employees",
    icon: IdCardLanyard,
    iconColor: "#F47B20",
    iconBg: "#FFF1E5",
    trend: "-2.3%",
    trendType: "down",
    chartColor: "#F47B20",
    chartPath:
      "M0 0 L32 16 L64 20 L96 9 L128 17 L160 33 L192 30 L224 21 L256 35 L288 48 L320 38 L352 36",
    key: "employeeCount",
    getValue: (data) =>
      data.employeeCount.toLocaleString("en-IN"),
    href: "/dashboard/employee",
  },
];

// ========================================
// SPARKLINE CHART
// ========================================

function Sparkline({ path, color, id }) {
  return (
    <div className="mt-auto w-full pt-3">
      <svg
        viewBox="0 0 352 52"
        preserveAspectRatio="none"
        className="h-[54px] w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`gradient-${id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="52"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.23"
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Gradient area */}
        <path
          d={`${path} L352 52 L0 52 Z`}
          fill={`url(#gradient-${id})`}
        />

        {/* Chart line */}
        <path
          d={path}
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// ========================================
// KPI CARD
// ========================================

function KpiCard({ card, value }) {
  const Icon = card.icon;

  const content = (
    <div
      className="
        group relative flex h-full min-h-[277px]
        flex-col overflow-hidden
        rounded-[25px]
        border border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_10px_rgba(10,46,102,0.055)]
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:border-[#D4DEEC]
        hover:shadow-[0_12px_28px_rgba(10,46,102,0.10)]
        sm:p-6
      "
    >
      {/* Top row: Icon and trend */}
      <div className="mb-4 flex items-center justify-between">

        {/* Icon */}
        <div
          className="
            flex h-[50px] w-[50px] shrink-0
            items-center justify-center
            rounded-[16px]
          "
          style={{
            backgroundColor: card.iconBg,
          }}
        >
          <Icon
            size={24}
            strokeWidth={2}
            style={{
              color: card.iconColor,
            }}
          />
        </div>

        {/* Trend badge */}
        <div
          className={`
            inline-flex items-center gap-1.5
            rounded-full px-3 py-1.5
            text-[14px] font-bold
            ${
              card.trendType === "up"
                ? "bg-[#E4F5EC] text-[#078451]"
                : "bg-[#FDEAEA] text-[#E53935]"
            }
          `}
        >
          {card.trendType === "up" ? (
            <ArrowUpRight size={16} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={16} strokeWidth={2.5} />
          )}

          <span>{card.trend}</span>
        </div>
      </div>

      {/* Card title */}
      <p className="mb-1.5 text-[16px] font-medium tracking-tight text-[#56647D]">
        {card.title}
      </p>

      {/* KPI Value */}
      <h3
        className="
          break-words
          text-[34px] font-bold
          leading-[1.2]
          tracking-[-1.2px]
          text-[#0C1B35]
          sm:text-[38px]
        "
      >
        {value}
      </h3>

      {/* Comparison text */}
      <p className="mt-1 text-[14px] font-normal text-[#8491A8]">
        vs last month
      </p>

      {/* Bottom chart */}
      <Sparkline
        path={card.chartPath}
        color={card.chartColor}
        id={card.key}
      />

    </div>
  );

  // Preserve existing navigation functionality
  if (card.href) {
    return (
      <Link
        href={card.href}
        aria-label={`View ${card.title}`}
        className="
          block h-full rounded-[25px]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#F27B1E]
          focus-visible:ring-offset-2
        "
      >
        {content}
      </Link>
    );
  }

  return content;
}

// ========================================
// MAIN KPI COMPONENT
// ========================================

export default function KPI() {
  const [clientCount, setClientCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalDealValue, setTotalDealValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Existing API functionality preserved
  useEffect(() => {
    let active = true;

    async function fetchKpiData() {
      const requests = [
        allClientCountService().then((res) => {
          if (active && res?.success) {
            setClientCount(res.data ?? 0);
          }
        }),

        allEmployeeService().then((res) => {
          if (active && res?.success) {
            setEmployeeCount(res.data ?? 0);
          }
        }),

        currentMonthDealValueService().then((res) => {
          if (active && res?.success) {
            setTotalDealValue(res.revenue ?? 0);
          }
        }),

        currentMonthRevenueService().then((res) => {
          if (active && res?.success) {
            setTotalRevenue(res.revenue ?? 0);
          }
        }),
      ];

      const results = await Promise.allSettled(requests);

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error(
            "Failed to fetch KPI data:",
            result.reason
          );
        }
      });
    }

    fetchKpiData();

    return () => {
      active = false;
    };
  }, []);

  const data = {
    dealValue: totalDealValue,
    clientCount,
    revenue: totalRevenue,
    employeeCount,
  };

  return (
    <section
      aria-label="Business overview"
      className="
        mb-6 grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        lg:mb-8
        lg:grid-cols-4
        lg:gap-5
      "
    >
      {KPI_CARDS.map((card) => (
        <KpiCard
          key={card.key}
          card={card}
          value={card.getValue(data)}
        />
      ))}
    </section>
  );
}
