"use client";

import {
  allClientCountService,
  allEmployeeService,
  currentMonthDealValueService,
  currentMonthRevenueService,
} from "@/service/admin-dashboard/dashboard-api";
import {
  ArrowUpRight,
  FileText,
  IdCardLanyard,
  IndianRupee,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// KPI Cards Data

export default function KPI() {
  const [clientCount, setClientCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalDealValue, setTotalDealValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  async function fetchCount() {
    try {
      const res = await allClientCountService();
      if (res.success) {
        setClientCount(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchEmployee() {
    try {
      const res = await allEmployeeService();
      if (res.success) {
        setEmployeeCount(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchDealValue() {
    try {
      const res = await currentMonthDealValueService();
      if (res.success) {
        setTotalDealValue(res.revenue);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchCurrentRevenue() {
    try {
      const res = await currentMonthRevenueService();
      if (res.success) {
        setTotalRevenue(res.revenue);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCount();
    fetchEmployee();
    fetchDealValue();
    fetchCurrentRevenue();
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <div className="bg-[#f3eaea] rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <IndianRupee className="text-blue-600 md:w-6 md:h-6" />
          </div>
          <div className="items-center gap-1 text-green-600 hidden md:flex">
            <ArrowUpRight size={16} />
            <span className="text-sm font-semibold">+12.5%</span>
          </div>
        </div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">
          Month Deal Value
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ₹ {totalDealValue.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="bg-[#f3eaea] rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <Users className="text-green-600 md:w-6 md:h-6" />
          </div>
          <div className="items-center gap-1 text-green-600 hidden md:flex">
            <ArrowUpRight size={16} />
            <span className="text-sm font-semibold">+8.2%</span>
          </div>
        </div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">
          Total Customers
        </h3>
        <p className="text-2xl font-bold text-slate-900">{clientCount || 0}</p>
      </div>

      <div className="bg-[#f3eaea] rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-purple-50 p-3 rounded-lg">
            <FileText className="text-purple-600 md:w-6 md:h-6" />
          </div>
          <div className="items-center gap-1 text-green-600 hidden md:flex">
            <ArrowUpRight size={16} />
            <span className="text-sm font-semibold">+3.1%</span>
          </div>
        </div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">
          Month Revenue
        </h3>
        <p className="text-2xl font-bold text-slate-900">
          ₹ {totalRevenue.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="bg-[#f3eaea] rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-orange-50 p-3 rounded-lg">
            <IdCardLanyard className="text-orange-600 md:w-6 md:h-6" />
          </div>
          <div className="items-center gap-1 text-green-600 hidden md:flex">
            <ArrowUpRight size={16} />
            <span className="text-sm font-semibold">-2.3%</span>
          </div>
        </div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">
          Total Employee
        </h3>
        <p className="text-2xl font-bold text-slate-900">{employeeCount}</p>
      </div>
    </div>
  );
}
