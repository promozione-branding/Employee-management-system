// app/employee-dashboard/EmployeeDashboard.jsx


"use client";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeClientsProgress from "@/components/employee-dashboard/common/EmployeeClientsProgress";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import RecentActivity from "@/components/employee-dashboard/common/RecentActivity";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import EmployeeAssigedClient from "@/components/employee-dashboard/common/EmployeeAssigedClient";

const EmployeeDashboard = () => {
  const { employee } = useEmployeeStore();

  return (
    <div className="min-w-0">
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <EmployeeCalendar employeeId={employee?._id} />
        <EmployeeTodo employeeId={employee?._id} />
        <EmployeeClientsProgress employeeId={employee?._id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <EmployeeReminder employeeId={employee?._id} />
        <EmployeeAssigedClient employeeId={employee?._id} />
        <RecentActivity employeeId={employee?._id} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <EmployeeAnnouncements />
        <AllEmployeeContact />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
