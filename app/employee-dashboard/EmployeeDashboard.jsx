"use client";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import Loading from "@/components/layout/Loading";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeClientsProgress from "@/components/employee-dashboard/common/EmployeeClientsProgress";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import RecentActivity from "@/components/employee-dashboard/common/RecentActivity";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const EmployeeDashboard = () => {
  const { employee } = useEmployeeStore();

  return (
    <div>
      <div className="flex flex-col lg:flex-row">
        <EmployeeCalendar employeeId={employee?._id} />
        <EmployeeTodo employeeId={employee?._id} />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-around">
        <EmployeeReminder employeeId={employee?._id} />
        <EmployeeClientsProgress employeeId={employee?._id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-10">
        <EmployeeAnnouncements />
        <RecentActivity employeeId={employee?._id} />
      </div>
      <AllEmployeeContact />
    </div>
  );
};

export default EmployeeDashboard;
