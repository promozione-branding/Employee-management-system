// components/wasteComponents/sales-dashboard/clients/[id]/page.jsx

import React from "react";
import ClientDetails from "./ClientDetails";

const page = async ({ params }) => {
  const { id } = await params;
  return <ClientDetails customerId={id}/>;
};

export default page;


