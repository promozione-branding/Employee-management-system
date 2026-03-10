import CreateLedgerPage from "./CreateLedger";

const page = async ({ params }) => {
  const { id } = await params;

  return <CreateLedgerPage customerId={id} />;
};

export default page;
