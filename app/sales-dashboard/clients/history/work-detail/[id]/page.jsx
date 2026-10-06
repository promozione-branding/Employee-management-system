// app/sales-dashboard/clients/history/work-detail/[id]/page.jsx

import React from "react";
import WorkDetail from "./WorkDetail";

const page = async ({ params }) => {
  const { id } = await params;
  return <WorkDetail customerId={id} />;
};

export default page;
