import React from "react";
import WorkDetails from "./WorkDetails";

const page = async ({ params }) => {
  const { id } = await params;
  return <WorkDetails workDetailId={id} />;
};

export default page;
