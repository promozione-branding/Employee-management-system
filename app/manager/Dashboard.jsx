// app/manager/Dashboard.jsx


"use client";

import React from "react";

import AdminCalendar from "@/components/admin-dashboard/dashboard/AdminCalendar";
// import AdminReminder from "@/components/admin-dashboard/dashboard/AdminReminder";
import RecentActivity from "@/components/admin-dashboard/dashboard/RecentActivity";
import TodayMeeting from "@/components/admin-dashboard/dashboard/TodayMeeting";
import Announcement from "@/components/admin-dashboard/dashboard/Announcement";
import Employees from "@/components/admin-dashboard/dashboard/Employees";
import ManagerReminder from "@/components/manager-dashboard/ManagerReminder";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="mb-2 text-xl font-bold text-slate-900 md:text-4xl">
          Manager Dashboard
        </h1>

        <p className="text-sm text-slate-600">
          Monitor reminders, meetings, customer interactions, and recent
          business activity.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1">
          <AdminCalendar />
        </div>

        <div className="min-w-0 flex-1">
          <Employees />
        </div>
      </div>

      <div className="my-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ManagerReminder />
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TodayMeeting />
        <Announcement />
      </div>
    </div>
  );
}
