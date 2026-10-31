
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
            Welcome back to your workspace. Here's your business performance
            overview. Monitor team activity, manage clients, and stay on top
            of today's priorities.
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
              Admin overview
            </p>
          </div>
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
