// app/sales-dashboard/SalesDashboard.jsx

"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
} from "lucide-react";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import TodayMeeting from "@/components/sales-dashboard/dashboard-cards/TodayMeeting";
import Shemar from "@/components/layout/Skeleton";
import RecentActivitySales from "@/components/sales-dashboard/dashboard-cards/RecentActivitySales";
import DailyCall from "@/components/sales-dashboard/dashboard-cards/DailyCall";
import TodaySalesReminder from "@/components/sales-dashboard/dashboard-cards/TodayReminder";
import ProposalSend from "@/components/sales-dashboard/dashboard-cards/ProposalSend";
import CurrentMonthDealValue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthDealValue";
import CurrentMonthRevenue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthRevenue";
import TotalClientCount from "@/components/sales-dashboard/dashboard-cards/TotalClientCount";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const SalesDashboard = () => {
  const { employee, loading } = useSalesEmployeeStore();
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  if (loading) return <Shemar />;
  if (!employee) return null;

  const userName =
    employee?.basicDetails?.name ||
    employee?.basicDetails?.email?.split("@")[0] ||
    "there";

  return (
    <div className="mx-auto w-full max-w-[1560px] min-w-0 space-y-6 sm:space-y-7 lg:space-y-8">
      {/* Page heading and personalized greeting hero banner */}
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#0A2E66] px-6 pb-7 pt-[82px] shadow-[0_8px_24px_rgba(10,46,102,0.12)] sm:px-8 sm:pb-8 lg:px-[38px]">
        {/* Top decorative striped awning */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[50px] overflow-hidden">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className={`relative h-[50px] min-w-[33px] flex-1 ${
                index % 2 === 0
                  ? "bg-[#F5A052]"
                  : index % 4 === 1
                    ? "bg-[#FFF2E5]"
                    : "bg-[#3769A9]"
              }`}
              style={{
                borderRadius: "0 0 20px 20px",
                marginRight: "-1px",
              }}
            />
          ))}
        </div>

        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-[#315A91]/25 blur-[80px]" />

        <div className="relative z-20">
          {/* Main greeting and actions */}
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            {/* Left content */}
            <div className="min-w-0 flex-1">
              {/* Date */}
              <p className="mb-1 text-[16px] font-semibold tracking-tight text-[#F58220]">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              {/* Greeting */}
              <h1 className="font-serif text-[34px] font-bold leading-[1.15] tracking-tight text-white sm:text-[40px] lg:text-[46px]">
                {greeting}, {userName}
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-[570px] text-[16px] font-medium leading-[1.7] text-[#C6D3E8] sm:text-[17px]">
                Welcome back to your workspace. Here's your sales performance
                overview. Monitor your calls, track proposals, and stay on top
                of today's targets.
              </p>
            </div>

            {/* Right workspace information */}
            <div className="flex shrink-0 items-center self-start rounded-2xl border border-white/15 bg-[#315487] px-4 py-3.5 shadow-sm lg:self-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <CalendarDays size={22} />
              </div>

              <div className="ml-3">
                <p className="text-xs font-medium text-[#C6D3E8]">
                  Your workspace
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  Sales overview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily calling activity / KPI cards */}
      <section aria-label="Daily call activity" className="min-w-0">
        <DailyCall />
      </section>

      {/* Meetings, Recent Activity & Proposals */}
      <section
  aria-label="Meetings and proposals"
  className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
>
  <div className="min-w-0">
    <TodayMeeting />
  </div>

  <div className="min-w-0">
    <RecentActivitySales />
  </div>

  <div className="min-w-0">
    <ProposalSend />
  </div>
</section>
      
      {/* Calendar, Todo, & Reminders */}
<section
  aria-label="Calendar and tasks"
  className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
>
  <div className="min-w-0">
    <EmployeeCalendar employeeId={employee?._id} />
  </div>

  <div className="min-w-0">
    <EmployeeTodo employeeId={employee?._id} />
  </div>

  <div className="min-w-0">
    <TodaySalesReminder />
  </div>
</section>


    {/* Reminders, Contacts & Announcements */}
<section
  aria-label="Operations and announcements"
  className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-3"
>
  <div className="min-w-0">
    <EmployeeReminder employeeId={employee?._id} />
  </div>
  <div className="min-w-0">
    <AllEmployeeContact />
  </div>
  <div className="min-w-0">
    <EmployeeAnnouncements />
  </div>
</section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#E3E7F0] pt-4 text-xs text-[#8A92A6] sm:flex-row sm:items-center sm:justify-between">
        <p>Inquiry Bazaar · Sales workspace</p>

        <p className="flex items-center gap-1.5">
          <Clock3 size={13} />
          Your sales performance overview in one place
        </p>
      </footer>
    </div>
  );
};

export default SalesDashboard;