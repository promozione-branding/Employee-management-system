"use client";

import { useEffect, useState } from "react";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import SalesSidebar from "@/components/layout/sales-dashboard/SalesSidebar";
import SalesNavbar from "@/components/layout/sales-dashboard/SalesNavbar";

const SalesDashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const details = useSalesEmployeeStore((s) => s.fetchEmployee);

  useEffect(() => {
    try {
      details();
    } catch (error) {
      console.log(error);
    }
  }, []);

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

export default SalesDashboardLayout;
