import SalesTask from "./SalesTask";

const page = async ({ params }) => {
  const { id } = await params;
  return <SalesTask employeeId={id} />;
};

export default page;
