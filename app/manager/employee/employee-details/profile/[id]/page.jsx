import React from "react";
import Profile from "./Profile";

const page = async ({ params }) => {
  const { id } = await params;

  return <Profile employeeId={id} />;
};

export default page;
