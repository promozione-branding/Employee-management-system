import React from "react";
import ClientDetails from "./ClientDetails";

const page = async ({ params }) => {
  const { clientId } = await params;


  return <ClientDetails customerId={clientId}/>;
};

export default page;
