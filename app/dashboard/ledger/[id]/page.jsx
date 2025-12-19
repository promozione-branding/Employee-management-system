import CreateLedgerPage from "./CreateLedger";

const page = async ({ params }) => {
  const { id } = await params;

  return <CreateLedgerPage proposalId={id} />;
};

export default page;
