"use client";

import Layout from "@/components/layout/employee-dashboard/Layout";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { useEffect } from "react";

export default function EmployeeDashboardLayout({ children }) {
  const details = useEmployeeStore((s) => s.fetchEmployee);

  useEffect(() => {
    try {
      details();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return <Layout>{children}</Layout>;
}
