import CreateInvoice from "./CreateInvoice";

const page = async ({ params }) => {
  const { id } = await params;

  return <CreateInvoice id={id} />;
};

export default page;
