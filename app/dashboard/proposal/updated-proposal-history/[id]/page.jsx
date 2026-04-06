import React from "react";
import UpdateProposalHistory from "./UpdateProposalHistory";

const page = async ({ params }) => {
  const { id } = await params;
  return <UpdateProposalHistory proposalId={id} />;
};

export default page;
