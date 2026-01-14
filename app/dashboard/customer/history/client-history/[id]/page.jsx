import React from "react";
import ClientHistory from "./ClientHistory";

const page = async ({ params }) => {
  const { id } = await params;
  return <ClientHistory customerId={id} />;
};

export default page;
