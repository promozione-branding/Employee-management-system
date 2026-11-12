
"use client";

import React, { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
} from "lucide-react";

import { useManagerEmployeeStore } from "@/lib/store/mangerStore";

import AdminCalendar from "@/components/admin-dashboard/dashboard/AdminCalendar";
import RecentActivity from "@/components/admin-dashboard/dashboard/RecentActivity";
import TodayMeeting from "@/components/admin-dashboard/dashboard/TodayMeeting";
import Announcement from "@/components/admin-dashboard/dashboard/Announcement";
import Employees from "@/components/admin-dashboard/dashboard/Employees";
import ManagerReminder from "@/components/manager-dashboard/ManagerReminder";

// Dynamic greeting based on current time
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

export default function Dashboard() {
  // Get logged-in manager details from Manager Employee Store
  const { employee, loading, fetchEmployee } = useManagerEmployeeStore();

  const [greeting, setGreeting] = useState("Welcome");

  // Set greeting based on current time
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Fetch manager details if not already available
  useEffect(() => {
    if (!employee && !loading) {
      fetchEmployee();
    }
  }, [employee, loading, fetchEmployee]);

  // Get manager's name from basicDetails
  const userName =
    employee?.basicDetails?.name ||
    employee?.basicDetails?.email?.split("@")[0] ||
    "Manager";

  return (
    <div className="mx-auto w-full max-w-[1560px] min-w-0 space-y-6 sm:space-y-7 lg:space-y-8">

      {/* Personalized Manager Greeting */}
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#0A2E66] px-6 pb-7 pt-[82px] shadow-[0_8px_24px_rgba(10,46,102,0.12)] sm:px-8 sm:pb-8 lg:px-[38px]">

        {/* Top Decorative Striped Awning */}
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

        {/* Background Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-[#315A91]/25 blur-[80px]" />

        <div className="relative z-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            {/* Greeting Content */}
            <div className="min-w-0 flex-1">

              {/* Current Date */}
              <p className="mb-1 text-[16px] font-semibold tracking-tight text-[#F58220]">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              {/* Dynamic Greeting */}
              <h1 className="font-serif text-[34px] font-bold leading-[1.15] tracking-tight text-white sm:text-[40px] lg:text-[46px]">
                {greeting}, {userName}
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-[570px] text-[16px] font-medium leading-[1.7] text-[#C6D3E8] sm:text-[17px]">
                Welcome back to your workspace. Stay connected with your
                team, manage daily reminders, track customer interactions,
                and keep up with today's business activities.
              </p>
            </div>

            {/* Workspace Information */}
            <div className="flex shrink-0 items-center self-start rounded-2xl border border-white/15 bg-[#315487] px-4 py-3.5 shadow-sm lg:self-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <CalendarDays size={22} />
              </div>

              <div className="ml-3">
                <p className="text-xs font-medium text-[#C6D3E8]">
                  Your workspace
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  Manager overview
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Calendar and Employees */}
      <section className="mb-5 grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-2">

        <div className="min-w-0">
          <AdminCalendar />
        </div>

        <div className="min-w-0">
          <Employees />
        </div>

      </section>

      {/* Manager Reminders and Recent Activity */}
      <section className="my-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">

        <div className="min-w-0">
          <ManagerReminder />
        </div>

        <div className="min-w-0">
          <RecentActivity />
        </div>

      </section>

      {/* Meetings and Announcements */}
      <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">

        <div className="min-w-0">
          <TodayMeeting />
        </div>

        <div className="min-w-0">
          <Announcement />
        </div>

      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#E3E7F0] pt-4 text-xs text-[#8A92A6] sm:flex-row sm:items-center sm:justify-between">

        <p>Inquiry Bazaar · Manager workspace</p>

        <p className="flex items-center gap-1.5">
          <Clock3 size={13} />
          Your business overview in one place
        </p>

      </footer>

    </div>
  );
}
