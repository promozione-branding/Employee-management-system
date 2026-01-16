import AllHistory from "./AllHistory";

const page = async ({ params }) => {
  const { id } = await params;
  return <AllHistory customerId={id} />;
};

export default page;
