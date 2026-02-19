import EmployeeTask from "./EmployeeTask";

const page = async ({ params }) => {
  const { id } = await params;
  return <EmployeeTask employeeId={id} />;
};

export default page;
