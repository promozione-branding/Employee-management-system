import ClientDetails from "./ClientDetails";

const page = async ({ params }) => {
  const { id } = await params;
  return <ClientDetails clientId={id} />;
};

export default page;
