import CreateLedger from "./CreateLedger";

const page = async ({ params }) => {
  const { id } = await params;

  return <CreateLedger proposalId={id} />;
};

export default page;
