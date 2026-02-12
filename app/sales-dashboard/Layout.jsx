"use client";

import SalesNavbar from "@/components/layout/sales-dashboard/SalesNavbar";
import SalesSidebar from "@/components/layout/sales-dashboard/SalesSidebar";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function SalesDashboardLayout({ children }) {
  const data = useSalesEmployeeStore((s) => s.fetchEmployee);

  useEffect(() => {
    try {
      data();
    } catch (error) {
      console.log(error);
      toast.success("error");
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SalesSidebar />

      {/* Right Section */}
      <div className="flex flex-col flex-1">
        <SalesNavbar />

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
