import React from "react";
import DeleteProposal from "./DeleteProposal";

const page = async ({ params }) => {
  const { id } = await params;
  return <DeleteProposal proposalId={id} />;
};

export default page;
