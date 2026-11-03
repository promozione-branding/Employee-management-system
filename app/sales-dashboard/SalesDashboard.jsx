// app/sales-dashboard/SalesDashboard.jsx

"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";

import CurrentMonthDealValue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthDealValue";
import CurrentMonthRevenue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthRevenue";
// import TotalClientCount from "@/components/sales-dashboard/dashboard-cards/TotalClientCount";
import ClientAcquisition from "@/components/sales-dashboard/dashboard-cards/ClientAcquisition";

import TodayMeeting from "@/components/sales-dashboard/dashboard-cards/TodayMeeting";
import RecentActivitySales from "@/components/sales-dashboard/dashboard-cards/RecentActivitySales";
import DailyCall from "@/components/sales-dashboard/dashboard-cards/DailyCall";
import TodaySalesReminder from "@/components/sales-dashboard/dashboard-cards/TodayReminder";
import ProposalSend from "@/components/sales-dashboard/dashboard-cards/ProposalSend";

import Shemar from "@/components/layout/Skeleton";

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
    <main className="mx-auto w-full max-w-[1560px] min-w-0 space-y-6 sm:space-y-7 lg:space-y-8">
      {/* Greeting banner */}
      <section className="relative isolate overflow-hidden rounded-[26px] bg-[#0A2E66] px-5 pb-7 pt-[78px] shadow-[0_8px_24px_rgba(10,46,102,0.12)] sm:rounded-[30px] sm:px-8 sm:pb-8 lg:px-[38px]">
        {/* Decorative top stripe */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[46px] overflow-hidden sm:h-[50px]">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className={`relative h-[46px] min-w-[25px] flex-1 sm:h-[50px] ${
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

        {/* Background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-[#315A91]/25 blur-[80px]" />

        <div className="relative z-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-semibold tracking-tight text-[#F58220] sm:text-base">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              <h1 className="break-words font-serif text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[40px] lg:text-[46px]">
                {greeting}, {userName}
              </h1>

              <p className="mt-3 max-w-[570px] text-sm font-medium leading-[1.7] text-[#C6D3E8] sm:text-base lg:text-[17px]">
                Welcome back to your workspace. Here&apos;s your sales
                performance overview. Monitor your calls, track proposals, and
                stay on top of today&apos;s targets.
              </p>
            </div>

            {/* Workspace badge */}
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

      {/* Daily calls: the two-column layout lives inside DailyCall */}
      <section aria-label="Daily call activity" className="min-w-0">
        <DailyCall />
      </section>

      {/* Monthly Sales Performance */}
      <section
        aria-label="Monthly sales performance"
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5"
      >
        <div className="min-w-0">
          <CurrentMonthDealValue />
        </div>

        <div className="min-w-0">
          <CurrentMonthRevenue />
        </div>

        <div className="min-w-0">
          <ClientAcquisition />
        </div>
      </section>

      {/* Meetings, Recent Activity and Proposals */}
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

      {/* Calendar, Todo and Reminders */}
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

      {/* Reminders, Contacts and Announcements */}
      <section
        aria-label="Operations and announcements"
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
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
    </main>
  );
};

export default SalesDashboard;
