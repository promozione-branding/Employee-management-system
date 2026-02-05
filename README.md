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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  Clock,
  Award,
  Calendar,
  Target,
  User,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import Loading from "@/components/layout/Loading";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeClientsProgress from "@/components/employee-dashboard/common/EmployeeClientsProgress";
import Announcement from "@/components/employee-dashboard/common/Announcement";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import RecentActivity from "@/components/employee-dashboard/common/RecentActivity";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";

const EmployeeDashboard = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [mainLoading, setMainLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("employeeData");
    if (storedData) {
      setEmployeeDetails(JSON.parse(storedData));
      setMainLoading(false);
    }
  }, []);

  console.log(employeeDetails?._id);

  // Employee Performance Data
  const performanceData = [
    { month: "Jan", performance: 75, target: 80, attendance: 95 },
    { month: "Feb", performance: 82, target: 80, attendance: 93 },
    { month: "Mar", performance: 88, target: 85, attendance: 96 },
    { month: "Apr", performance: 85, target: 85, attendance: 94 },
    { month: "May", performance: 90, target: 85, attendance: 97 },
    { month: "Jun", performance: 92, target: 90, attendance: 95 },
  ];

  // Department Distribution
  const departmentData = [
    { name: "Sales", value: 45, fill: "#3b82f6" },
    { name: "Engineering", value: 38, fill: "#10b981" },
    { name: "HR", value: 12, fill: "#f59e0b" },
    { name: "Marketing", value: 15, fill: "#8b5cf6" },
    { name: "Operations", value: 20, fill: "#ec4899" },
  ];

  // Employee Tenure
  const tenureData = [
    { range: "0-1 yr", count: 12, fill: "#ef4444" },
    { range: "1-3 yr", count: 28, fill: "#f97316" },
    { range: "3-5 yr", count: 35, fill: "#eab308" },
    { range: "5-10 yr", count: 26, fill: "#84cc16" },
    { range: "10+ yr", count: 29, fill: "#22c55e" },
  ];

  // Leave & Attendance
  const leaveData = [
    { month: "Jan", present: 20, absent: 2, leave: 3 },
    { month: "Feb", present: 18, absent: 2, leave: 5 },
    { month: "Mar", present: 21, absent: 1, leave: 3 },
    { month: "Apr", present: 19, absent: 1, leave: 5 },
    { month: "May", present: 22, absent: 0, leave: 3 },
    { month: "Jun", present: 20, absent: 2, leave: 3 },
  ];

  // Skills Assessment Data
  const skillsData = [
    { skill: "Communication", value: 85 },
    { skill: "Technical", value: 78 },
    { skill: "Leadership", value: 72 },
    { skill: "Problem Solving", value: 88 },
    { skill: "Teamwork", value: 90 },
    { skill: "Time Management", value: 80 },
  ];

  // Salary Distribution
  const salaryData = [
    { range: "$20K-$30K", count: 15 },
    { range: "$30K-$40K", count: 28 },
    { range: "$40K-$50K", count: 32 },
    { range: "$50K-$60K", count: 18 },
    { range: "$60K+", count: 17 },
  ];

  // KPI Cards
  const kpiCards = [
    {
      title: "Total Client",
      value: "130",
      change: "+5",
      isPositive: true,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Avg Performance",
      value: "87.3%",
      change: "+4.2%",
      isPositive: true,
      icon: Award,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Attendance Rate",
      value: "95.2%",
      change: "+1.5%",
      isPositive: true,
      icon: Calendar,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Avg Salary",
      value: "$45,200",
      change: "+3.8%",
      isPositive: true,
      icon: TrendingUp,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  // Recent Employees
  const recentEmployees = [
    {
      id: 1,
      name: "John Smith",
      position: "Senior Developer",
      department: "Engineering",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      avatar: "👨‍💼",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Marketing Manager",
      department: "Marketing",
      email: "sarah.j@company.com",
      phone: "+1 (555) 234-5678",
      avatar: "👩‍💼",
      status: "Active",
    },
    {
      id: 3,
      name: "Michael Chen",
      position: "HR Specialist",
      department: "HR",
      email: "michael.chen@company.com",
      phone: "+1 (555) 345-6789",
      avatar: "👨‍💼",
      status: "On Leave",
    },
  ];

  if (mainLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="">
        <EmployeeCalendar employeeId={employeeDetails?._id} />

        <EmployeeTodo employeeId={employeeDetails?._id} />
        <EmployeeReminder employeeId={employeeDetails?._id} />

        <EmployeeClientsProgress employeeId={employeeDetails?._id} />

        <EmployeeAnnouncements />
        <RecentActivity employeeId={employeeDetails?._id} />
        <AllEmployeeContact />
      </div>

      <div className="min-h-screen  p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`${card.iconColor} w-6 h-6`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 ${card.isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {card.isPositive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    <span className="text-sm font-semibold">{card.change}</span>
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="bg-white border-b">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Performance Chart */}
          <TabsContent value="performance">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Performance & Attendance Trends
                </h2>
                <p className="text-slate-600 text-sm">
                  Monthly employee performance vs target and attendance rate
                </p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={performanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
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
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#f59e0b", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Departments Chart */}
          <TabsContent value="departments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Employees by Department
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Distribution across departments
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tenure Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Employee Tenure Distribution
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Years of service distribution
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={tenureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {tenureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Attendance Chart */}
          <TabsContent value="attendance">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Leave & Attendance Report
                </h2>
                <p className="text-slate-600 text-sm">
                  Monthly breakdown of present, absent, and leave days
                </p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={leaveData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
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
                    dataKey="present"
                    stackId="1"
                    fill="#10b981"
                    stroke="#10b981"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stackId="1"
                    fill="#ef4444"
                    stroke="#ef4444"
                  />
                  <Area
                    type="monotone"
                    dataKey="leave"
                    stackId="1"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Skills Chart */}
          <TabsContent value="skills">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Team Skills Assessment
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Average skill levels across the team (0-100)
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={skillsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" stroke="#64748b" />
                    <PolarRadiusAxis
                      stroke="#64748b"
                      angle={90}
                      domain={[0, 100]}
                    />
                    <Radar
                      name="Skill Level"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Salary Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Salary Distribution
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Number of employees by salary range
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salaryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis
                      dataKey="range"
                      type="category"
                      stroke="#64748b"
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Employees */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{employee.avatar}</div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold">
                        {employee.name}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {employee.position}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {employee.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {employee.status}
                    </span>
                    <p className="text-slate-600 text-sm mt-2">
                      {employee.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Users size={18} className="mr-2" /> Add New Employee
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar size={18} className="mr-2" /> Manage Leave
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award size={18} className="mr-2" /> Performance Review
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock size={18} className="mr-2" /> Attendance Report
                </Button>
              </div>
            </div>

            {/* Important Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Today's Summary
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-600 text-sm font-medium">
                    Present Today
                  </p>
                  <p className="text-2xl font-bold text-green-700">127</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 text-sm font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-700">2</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-yellow-600 text-sm font-medium">
                    On Leave
                  </p>
                  <p className="text-2xl font-bold text-yellow-700">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
