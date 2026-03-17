"use client";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import TodayMeeting from "@/components/sales-dashboard/dashboard-cards/TodayMeeting";
import Shemar from "@/components/layout/Skeleton";
import RecentActivitySales from "@/components/sales-dashboard/dashboard-cards/RecentActivitySales";
import DailyCall from "@/components/sales-dashboard/dashboard-cards/DailyCall";
import TodaySalesReminder from "@/components/sales-dashboard/dashboard-cards/TodayReminder";
import ProposalSend from "@/components/sales-dashboard/dashboard-cards/ProposalSend";
import CurrentMonthDealValue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthDealValue";
import CurrentMonthRevenue from "@/components/sales-dashboard/dashboard-cards/CurrentMonthRevenue";
import TotalClientCount from "@/components/sales-dashboard/dashboard-cards/TotalClientCount";

const SalesDashboard = () => {
  const { employee, loading } = useSalesEmployeeStore();

  if (loading) return <Shemar />;
  if (!employee) return null;

  return (
    <div className="">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DailyCall />
        <CurrentMonthDealValue />
        <CurrentMonthRevenue />
        <TotalClientCount />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 my-5">
        <TodayMeeting />
        <RecentActivitySales />
        <ProposalSend />
      </div>

      <div className="flex flex-col lg:flex-row mt-5 gap-5 ">
        <EmployeeCalendar employeeId={employee?._id} />
        <EmployeeTodo employeeId={employee?._id} />
        <TodaySalesReminder />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-5">
        <EmployeeReminder employeeId={employee?._id} />
        <AllEmployeeContact />
        <EmployeeAnnouncements />
      </div>


    </div>
  );
};

export default SalesDashboard;
