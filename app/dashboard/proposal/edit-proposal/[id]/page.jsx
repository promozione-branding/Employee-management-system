// app/dashboard/proposal/edit-proposal/[id]/page.jsx

import EditProposal from "./EditPropsal";

const page = async ({ params }) => {
  const { id } = await params;

  return <EditProposal proposalId={id}/>;
};

export default page;
