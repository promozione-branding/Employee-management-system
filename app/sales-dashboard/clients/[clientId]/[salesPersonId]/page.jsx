// app/sales-dashboard/clients/[clientId]/[salesPersonId]/page.jsx

import React from "react";
import ClientDetails from "./ClientDetails";

const page = async ({ params }) => {
  const { clientId, salesPersonId } = await params;
  return <ClientDetails customerId={clientId} salesPersonId={salesPersonId} />;
};

export default page;
