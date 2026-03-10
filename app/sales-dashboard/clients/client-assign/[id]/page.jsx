import ClientAssign from "./ClientAssign";

const page = async ({ params }) => {
  const { id } = await params;

  return <ClientAssign clientId={id} />;
};

export default page;
