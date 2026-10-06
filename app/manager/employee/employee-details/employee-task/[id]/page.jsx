// app/manager/employee/employee-details/employee-task/[id]/page.jsx

import EmployeeTask from "./EmployeeTask";

const page = async ({ params }) => {
  const { id } = await params;
  return <EmployeeTask employeeId={id} />;
};

export default page;
