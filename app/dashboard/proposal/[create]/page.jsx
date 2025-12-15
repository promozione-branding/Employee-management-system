import React from "react";
import Proposal from "./Proposal";

const page = async ({ params }) => {
  const { create: customerId } = await params;

  const { create:proposalId } = await params;


  return <Proposal customerId={customerId} proposalId={proposalId}/>;
};

export default page;
