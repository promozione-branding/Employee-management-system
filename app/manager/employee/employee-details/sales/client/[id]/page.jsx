// app/manager/employee/employee-details/sales/client/[id]/page.jsx

import React from "react";
import AssignedClient from "./AssignedClient";

const page = async ({ params }) => {
  const { id } = await params;
  return <AssignedClient employeeId={id} />;
};

export default page;
