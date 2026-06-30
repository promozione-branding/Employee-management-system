import React from "react";
import AssignedClient from "./AssignedClient";

const page = async ({ params }) => {
  const { id } = await params;
  return <AssignedClient employeeId={id} />;
};

export default page;
