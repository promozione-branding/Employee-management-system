import React from "react";
import Client from "./Client";

const page = async ({ params }) => {
  const { id } = await params;
  return <Client employeeId={id} />;
};

export default page;
