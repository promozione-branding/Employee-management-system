// app/manager/employee/employee-details/edit-basic-details/[id]/page.jsx

import EditBasicDetail from "./EditBasicDetail";

const page = async ({ params }) => {
  const { id } = await params;

  return <EditBasicDetail employeeId={id} />;
};

export default page;
