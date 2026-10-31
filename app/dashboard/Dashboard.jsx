
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
} from "lucide-react";

import { useAdminStore } from "@/lib/store/AdminStore";

import { MyClient } from "@/components/admin-dashboard/dashboard/MyClient";
import KPI from "@/components/admin-dashboard/dashboard/KPI";
import Employees from "@/components/admin-dashboard/dashboard/Employees";
import Callinfo from "@/components/admin-dashboard/dashboard/Callinfo";
import RecentActivity from "@/components/admin-dashboard/dashboard/RecentActivity";
import Announcement from "@/components/admin-dashboard/dashboard/Announcement";
import TodayMeeting from "@/components/admin-dashboard/dashboard/TodayMeeting";
import AdminReminder from "@/components/admin-dashboard/dashboard/AdminReminder";
import AdminCalendar from "@/components/admin-dashboard/dashboard/AdminCalendar";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const Dashboard = () => {
  const { adminDetail } = useAdminStore();

  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const userName =
    adminDetail?.username ||
    adminDetail?.email?.split("@")[0] ||
    "there";

  return (
    <div className="mx-auto w-full max-w-[1560px] min-w-0 space-y-6 sm:space-y-7 lg:space-y-8">
      {/* Page heading and personalized greeting */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-5 shadow-[0_3px_12px_rgba(10,46,102,0.04)] sm:p-6 lg:p-7">
        {/* Decorative brand accent */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#F27B1E]" />

        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#E9EFF9]/80 sm:h-56 sm:w-56" />

        <div className="pointer-events-none absolute -right-5 -top-10 h-28 w-28 rounded-full border border-[#E3E7F0] sm:h-36 sm:w-36" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {/* Section label */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E9EFF9] px-3 py-1.5 text-xs font-semibold text-[#0A2E66]">
              <ChartNoAxesCombined
                size={15}
                className="text-[#F27B1E]"
              />
              Business overview
            </div>

            {/* Personalized greeting */}
            <h1 className="break-words text-2xl font-bold tracking-tight text-[#0A2E66] sm:text-3xl lg:text-4xl">
              {greeting}, {userName}!
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5B6478] sm:text-[15px]">
              Welcome back to your workspace. Here&apos;s your business
              performance overview. Monitor team activity, manage clients,
              and stay on top of today&apos;s priorities.
            </p>
          </div>

          {/* Workspace information */}
          <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-[#E3E7F0] bg-[#F2F4F9] px-3.5 py-3 sm:self-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#F27B1E] shadow-sm">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-xs font-medium text-[#5B6478]">
                Your workspace
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[#0A2E66]">
                Admin overview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section
        aria-label="Key performance indicators"
        className="min-w-0"
      >
        <KPI />
      </section>

      {/* Daily calling activity */}
      <section
        aria-label="Team call activity"
        className="min-w-0"
      >
        <Callinfo />
      </section>

      {/* Calendar and team */}
      <section className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <div className="min-w-0">
          <AdminCalendar />
        </div>

        <div className="min-w-0">
          <Employees />
        </div>
      </section>

      {/* Reminders, activity and clients */}
      <section
        aria-label="Daily operations"
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3"
      >
        <div className="min-w-0">
          <AdminReminder />
        </div>

        <div className="min-w-0">
          <RecentActivity />
        </div>

        <div className="min-w-0">
          <MyClient />
        </div>
      </section>

      {/* Announcements and meetings */}
      <section
        aria-label="Announcements and meetings"
        className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2"
      >
        <div className="min-w-0">
          <Announcement />
        </div>

        <div className="min-w-0">
          <TodayMeeting />
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#E3E7F0] pt-4 text-xs text-[#8A92A6] sm:flex-row sm:items-center sm:justify-between">
        <p>Inquiry Bazaar · Admin workspace</p>

        <p className="flex items-center gap-1.5">
          <Clock3 size={13} />
          Your business overview in one place
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
