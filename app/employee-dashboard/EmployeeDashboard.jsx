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

  if (mainLoading) {
    return <Loading />;
  }

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row">
        <EmployeeCalendar employeeId={employeeDetails?._id} />
        <EmployeeTodo employeeId={employeeDetails?._id} />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-around">
        <EmployeeReminder employeeId={employeeDetails?._id} />
        <EmployeeClientsProgress employeeId={employeeDetails?._id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-10">
        <EmployeeAnnouncements />
        <RecentActivity employeeId={employeeDetails?._id} />
      </div>
      <AllEmployeeContact />
    </div>
  );
};

export default EmployeeDashboard;
