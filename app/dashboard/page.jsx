"use client";


import { MyClient } from "@/components/admin-dashboard/dashboard/MyClient";
import KPI from "@/components/admin-dashboard/dashboard/KPI";
import Employees from "@/components/admin-dashboard/dashboard/Employees";
import RecentActivity from "@/components/admin-dashboard/dashboard/RecentActivity";
import Announcement from "@/components/admin-dashboard/dashboard/Announcement";
import TodayMeeting from "@/components/admin-dashboard/dashboard/TodayMeeting";

const Dashboard = () => {

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Welcome back! Here's your business performance overview.
        </p>
      </div>

      {/* KPI Cards */}
      <KPI />

      {/* employee  */}
      <Employees />

      {/* Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:h-[70vh]">
        <RecentActivity />
        <MyClient />
        <Announcement />
        <TodayMeeting />
      </div>
    </div>
  );
};

export default Dashboard;
