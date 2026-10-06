// app/manager/employee/employee-details/sales/[id]/page.jsx

import React from "react";
import EmployeeDetailsDashboard from "./EmployeeDetailsDashboard";

const page = async ({ params }) => {
  const { id } = await params;
  return <EmployeeDetailsDashboard employeeId={id} />;
};

export default page;
