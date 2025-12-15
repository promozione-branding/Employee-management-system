import React from "react";
import EditInvoice from "./EditInvoice";

const page = async({params}) => {
  const {id} = await params;
  return <EditInvoice id={id}/>
};

export default page;
