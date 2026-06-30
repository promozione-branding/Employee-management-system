import React from "react";
import WorkDetail from "./WorkDetail";

const page = async ({ params }) => {
  const { id } = await params;
  return <WorkDetail customerId={id} />;
};

export default page;
