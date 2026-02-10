import CreateProposal from "./CreateProposal";

const page = async ({ params }) => {
  const { id } = await params;
  return <CreateProposal customerId={id} />;
};

export default page;

