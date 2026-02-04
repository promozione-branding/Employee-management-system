"use client";
import React, { useState } from "react";
import SalesSidebar from "./SalesSidebar";
import SalesNavbar from "./SalesNavbar";


const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SalesSidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <SalesNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
