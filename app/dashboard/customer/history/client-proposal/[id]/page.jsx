// app/dashboard/customer/history/client-proposal/[id]/page.jsx

import ClientProposal from "./ClientProposal";

const page = async ({ params }) => {
  const { id } = await params;

  return <ClientProposal clientId={id} />;
};

export default page;
