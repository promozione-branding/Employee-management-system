
"use client";

import {
  allClientCountService,
  allEmployeeService,
  currentMonthDealValueService,
  currentMonthRevenueService,
} from "@/service/admin-dashboard/dashboard-api";
import {
  ArrowUpRight,
  FileText,
  IdCardLanyard,
  IndianRupee,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const KPI_CARDS = [
  {
    title: "Month Deal Value",
    icon: IndianRupee,
    iconColor: "#2B5086",
    iconBg: "#E9EFF9",
    getValue: (data) => `₹ ${data.dealValue.toLocaleString("en-IN")}`,
    key: "dealValue",
  },
  {
    title: "Total Customers",
    icon: Users,
    iconColor: "#17845A",
    iconBg: "#E5F5EC",
    getValue: (data) => data.clientCount.toLocaleString("en-IN"),
    key: "clientCount",
    href: "/dashboard/customer",
  },
  {
    title: "Month Revenue",
    icon: FileText,
    iconColor: "#6A4FD6",
    iconBg: "#EFEBFC",
    getValue: (data) => `₹ ${data.revenue.toLocaleString("en-IN")}`,
    key: "revenue",
  },
  {
    title: "Total Employees",
    icon: IdCardLanyard,
    iconColor: "#F27B1E",
    iconBg: "#FFF1E4",
    getValue: (data) => data.employeeCount.toLocaleString("en-IN"),
    key: "employeeCount",
    href: "/dashboard/employee",
  },
];

function KpiCard({ card, value }) {
  const Icon = card.icon;

  const content = (
    <div className="group h-full rounded-[20px] border border-[#E3E7F0] bg-white p-4 shadow-[0_3px_12px_rgba(10,46,102,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D2DCEC] hover:shadow-[0_8px_24px_rgba(10,46,102,0.09)] sm:p-5 lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] sm:h-12 sm:w-12"
          style={{ backgroundColor: card.iconBg }}
        >
          <Icon
            size={22}
            strokeWidth={2}
            style={{ color: card.iconColor }}
          />
        </div>

        {card.href && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FC] text-[#8A92A6] transition-colors group-hover:bg-[#FFF1E4] group-hover:text-[#F27B1E]">
            <ArrowUpRight size={17} />
          </span>
        )}
      </div>

      <p className="mb-2 text-xs font-semibold tracking-wide text-[#5B6478] sm:text-sm">
        {card.title}
      </p>

      <p className="break-words text-xl font-bold leading-tight tracking-tight text-[#0F1B33] sm:text-2xl lg:text-[27px]">
        {value}
      </p>
    </div>
  );

  if (card.href) {
    return (
      <Link
        href={card.href}
        aria-label={`View ${card.title}`}
        className="block h-full rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27B1E] focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default function KPI() {
  const [clientCount, setClientCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalDealValue, setTotalDealValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchKpiData() {
      const requests = [
        allClientCountService().then((res) => {
          if (active && res?.success) setClientCount(res.data ?? 0);
        }),
        allEmployeeService().then((res) => {
          if (active && res?.success) setEmployeeCount(res.data ?? 0);
        }),
        currentMonthDealValueService().then((res) => {
          if (active && res?.success) setTotalDealValue(res.revenue ?? 0);
        }),
        currentMonthRevenueService().then((res) => {
          if (active && res?.success) setTotalRevenue(res.revenue ?? 0);
        }),
      ];

      const results = await Promise.allSettled(requests);

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to fetch KPI data:", result.reason);
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
      className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-8 lg:grid-cols-4"
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
