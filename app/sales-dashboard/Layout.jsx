"use client";

import SalesNavbar from "@/components/layout/sales-dashboard/SalesNavbar";
import SalesSidebar from "@/components/layout/sales-dashboard/SalesSidebar";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import React, { useEffect, useState } from "react";

export default function SalesLayout({ children }) {
  const [open, setOpen] = useState(false);
  const fetchEmployee = useSalesEmployeeStore((s) => s.fetchEmployee);
  const { employee, loading } = useSalesEmployeeStore();

  useEffect(() => {
    if (!employee) {
      fetchEmployee().then(() => {
        console.log("Employee fetched");
      });
    }
  }, []);

  if (loading) return null; 

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SalesSidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <SalesNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
