import ClientInvoice from "./ClientInvoice";

const page = async ({ params }) => {
  const { id } = await params;

  return <ClientInvoice clientId={id} />;
};

export default page;
