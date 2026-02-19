"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Building,
  Code,
  Globe,
  Palette,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { MyClient } from "@/components/admin-dashboard/dashboard/MyClient";
import KPI from "@/components/admin-dashboard/dashboard/KPI";
import Employees from "@/components/admin-dashboard/dashboard/Employees";

const Dashboard = () => {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Client Meeting",
      start: new Date().toISOString().split("T")[0],
      backgroundColor: "#3b82f6",
      borderColor: "#1e40af",
    },
    {
      id: "2",
      title: "Project Deadline",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      backgroundColor: "#ef4444",
      borderColor: "#7f1d1d",
    },
    {
      id: "3",
      title: "Team Sync",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      backgroundColor: "#10b981",
      borderColor: "#065f46",
    },
  ]);

  // Revenue Data
  const revenueData = [
    { month: "Jan", revenue: 40000, expenses: 24000, profit: 16000 },
    { month: "Feb", revenue: 45000, expenses: 26000, profit: 19000 },
    { month: "Mar", revenue: 52000, expenses: 28000, profit: 24000 },
    { month: "Apr", revenue: 58000, expenses: 30000, profit: 28000 },
    { month: "May", revenue: 65000, expenses: 32000, profit: 33000 },
    { month: "Jun", revenue: 72000, expenses: 35000, profit: 37000 },
  ];

  // Customer Data
  const customerData = [
    { name: "Active", value: 340, fill: "#3b82f6" },
    { name: "Inactive", value: 85, fill: "#ef4444" },
    { name: "Pending", value: 42, fill: "#f59e0b" },
  ];

  // Project Status
  const projectData = [
    { status: "Completed", count: 24, fill: "#10b981" },
    { status: "In Progress", count: 18, fill: "#3b82f6" },
    { status: "On Hold", count: 8, fill: "#f59e0b" },
  ];

  // Performance Data
  const performanceData = [
    { week: "Week 1", performance: 65, target: 75 },
    { week: "Week 2", performance: 72, target: 75 },
    { week: "Week 3", performance: 78, target: 80 },
    { week: "Week 4", performance: 85, target: 85 },
  ];

 

  async function fetchClientCount() {
    try {
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {}, []);

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
      <div className="flex gap-2 items-start">
        <div className="mb-8 w-full lg:w-1/2 border rounded-lg">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Schedule & Events
              </h2>
              <p className="text-slate-600 text-sm">
                View and manage your upcoming events and meetings
              </p>
            </div>
            <div className="calendar-wrapper ">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                height="auto"
                contentHeight="auto"
              />
            </div>
          </div>
        </div>
       <MyClient />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="mb-8">
        <TabsList className="bg-white border-b">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Revenue Chart */}
        <TabsContent value="revenue">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Revenue Overview
              </h2>
              <p className="text-slate-600 text-sm">
                Monthly revenue, expenses, and profit trends
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Bar dataKey="expenses" fill="#005bc9" opacity={0.6} />
                <Bar dataKey="profit" fill="#10b981" opacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Performance Chart */}
        <TabsContent value="performance">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Performance Metrics
              </h2>
              <p className="text-slate-600 text-sm">
                Weekly performance vs. target goals
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={performanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Distribution Charts */}
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Customer Distribution
                </h2>
                <p className="text-slate-600 text-sm">
                  Active, inactive, and pending customers
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Project Status
                </h2>
                <p className="text-slate-600 text-sm">
                  Completion status breakdown
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis
                    dataKey="status"
                    type="category"
                    stroke="#64748b"
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "New customer onboarded",
                time: "2 hours ago",
                icon: "👤",
              },
              {
                title: "Invoice #INV-2024-001 created",
                time: "4 hours ago",
                icon: "📄",
              },
              {
                title: 'Project "Website Redesign" completed',
                time: "1 day ago",
                icon: "✅",
              },
              {
                title: "Meeting scheduled with client",
                time: "1 day ago",
                icon: "📅",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{activity.title}</p>
                  <p className="text-slate-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-1">
                Avg. Deal Value
              </p>
              <p className="text-2xl font-bold text-blue-600">$12,450</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-1">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-green-600">34.5%</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-1">
                Avg. Response Time
              </p>
              <p className="text-2xl font-bold text-purple-600">2.4 hrs</p>
            </div>
            <Button className="w-full mt-2">View Full Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
