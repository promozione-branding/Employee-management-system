// app/employee-dashboard/clients/history/attachment-history/[id]/page.jsx

import React from "react";
import AttachmentHistory from "./AttachmentHistory";

const page = async ({ params }) => {
  const { id } = await params;
  return <AttachmentHistory clientId={id} />;
};

export default page;
