// components/wasteComponents/sales-dashboard/proposal/edit-proposal/[id]/page.jsx

import React from "react";
import EditPropsal from "./EditPropsal";

const page = async ({ params }) => {
  const { id } = await params;

  return <EditPropsal id={id}/>;
};

export default page;


