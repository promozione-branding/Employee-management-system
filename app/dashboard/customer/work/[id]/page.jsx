import React from "react";
import ClientWork from "./Work";

const page = async ({ params }) => {
  const { id } = await params;
  return <ClientWork customerId={id} />;
};

export default page;
