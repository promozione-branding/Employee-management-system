import EditBasicDetail from "./EditBasicDetail";

const page = async ({ params }) => {
  const { id } = await params;

  return <EditBasicDetail employeeId={id} />;
};

export default page;
