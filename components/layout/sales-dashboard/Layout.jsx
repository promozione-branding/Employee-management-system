"use client";

import { useEffect, useState } from "react";
import SalesSidebar from "./SalesSidebar";
import SalesNavbar from "./SalesNavbar";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const fetchEmployee = useSalesEmployeeStore((s) => s.fetchEmployee);

   useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

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
