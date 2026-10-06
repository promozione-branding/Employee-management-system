// app/employee-dashboard/clients/history/sales-history/[id]/page.jsx

import React from "react";
import MeetingHistory from "./MeetingHistory";

const page = async ({ params }) => {
  const { id } = await params;
  return <MeetingHistory customerId={id} />;
};

export default page;
