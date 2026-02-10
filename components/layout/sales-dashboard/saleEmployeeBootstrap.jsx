"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";

export default function SalesEmployeeBootstrap() {
  const setEmployee = useSalesEmployeeStore((s) => s.setEmployee);
  const clearEmployee = useSalesEmployeeStore((s) => s.clearEmployee);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeDetailsService();
        if (res?.success) {
          setEmployee(res.data);
        } else {
          clearEmployee();
        }
      } catch (err) {
        clearEmployee();
        toast.error("Failed to load employee");
      }
    };

    fetchEmployee();
  }, [setEmployee, clearEmployee]);

  return null; // invisible bootstrap
}
