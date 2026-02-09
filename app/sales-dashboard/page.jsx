// "use client";

// export const dynamic = "force-dynamic";

// import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
// import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
// import Loading from "@/components/layout/Loading";
// import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
// import EmployeeClientsProgress from "@/components/employee-dashboard/common/EmployeeClientsProgress";
// import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
// import RecentActivity from "@/components/employee-dashboard/common/RecentActivity";
// import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
// import { useEmployee } from "@/components/layout/sales-dashboard/Layout";

// const SalesDashboard = () => {
//   const { basicEmployeeData, loading } = useEmployee();

//   if (loading) {
//     return <Loading />;
//   }

//   if (!basicEmployeeData) return null;

//   return (
//     <div className="">
//       <div className="flex flex-col lg:flex-row">
//         <EmployeeCalendar employeeId={basicEmployeeData?._id} />
//         <EmployeeTodo employeeId={basicEmployeeData?._id} />
//       </div>

//       <div className="flex flex-col lg:flex-row lg:justify-around">
//         <EmployeeReminder employeeId={basicEmployeeData?._id} />
//         <EmployeeClientsProgress employeeId={basicEmployeeData?._id} />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 mt-10">
//         <EmployeeAnnouncements />
//         <RecentActivity employeeId={basicEmployeeData?._id} />
//       </div>
//       <AllEmployeeContact />
//     </div>
//   );
// };

// export default SalesDashboard;



// testing 

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page