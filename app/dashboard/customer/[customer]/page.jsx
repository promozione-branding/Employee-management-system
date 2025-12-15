import CustomerDashboard from "./CustomerDashboard";

const page = async({ params }) => {
  // The 'customer' property corresponds to the folder name `[customer]`
  const { customer: customerId } = await params;

  return <CustomerDashboard customerId={customerId} />;
};

export default page;
