import React from "react";
import SeoReport from "./SeoReport";

const page = async ({ params }) => {
  const { id } = await params;
  return <SeoReport clientId={id} />;
};

export default page;
