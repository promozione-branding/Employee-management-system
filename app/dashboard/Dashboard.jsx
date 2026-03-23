"use client";

import { MyClient } from "@/components/admin-dashboard/dashboard/MyClient";
import KPI from "@/components/admin-dashboard/dashboard/KPI";
import Employees from "@/components/admin-dashboard/dashboard/Employees";
import RecentActivity from "@/components/admin-dashboard/dashboard/RecentActivity";
import Announcement from "@/components/admin-dashboard/dashboard/Announcement";
import TodayMeeting from "@/components/admin-dashboard/dashboard/TodayMeeting";
import AdminReminder from "@/components/admin-dashboard/dashboard/AdminReminder";
import AdminCalendar from "@/components/admin-dashboard/dashboard/AdminCalendar";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl md:text-4xl font-bold text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 text-sm">
          Welcome back! Here's your business performance overview.
        </p>
      </div>

      {/* KPI Cards */}
      <KPI />

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-5">
        <AdminCalendar />
        <Employees />
      </div>
      {/* employee  */}

      <div className="grid lg:grid-cols-3 gap-5 my-5">
        <AdminReminder />
        <RecentActivity />
        <MyClient />
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:h-[70vh]">
        <Announcement />
        <TodayMeeting />
      </div>
    </div>
  );
};

export default Dashboard;
