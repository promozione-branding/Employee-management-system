import React from "react";
import SeoSheet from "./SeoSheet";

const page = async ({ params }) => {
  const { id } = await params;
  return <SeoSheet clientId={id} />;
};

export default page;
