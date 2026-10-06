// app/sales-dashboard/proposal/[id]/page.jsx

import CreateProposal from "./CreateProposal";

const page = async ({ params }) => {
  const { id } = await params;
  return <CreateProposal customerId={id} />;
};

export default page;


