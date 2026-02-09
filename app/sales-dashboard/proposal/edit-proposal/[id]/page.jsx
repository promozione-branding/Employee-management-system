import React from "react";
import EditPropsal from "./EditPropsal";

const page = async ({ params }) => {
  const { id } = await params;

  return <EditPropsal id={id}/>;
};

export default page;
