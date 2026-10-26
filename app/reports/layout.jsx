// app/reports/layout.jsx

"use client";

import SideBar from "@/components/layout/SideBar";
import { useAdminStore } from "@/lib/store/AdminStore";
import { useEffect } from "react";

export default function ReportsLayout({ children }) {
  const details = useAdminStore((s) => s.fetchAdminDetails);

  useEffect(() => {
    try {
      details();
    } catch (error) {
      console.log(error);
    }
  }, [details]);

  return <SideBar>{children}</SideBar>;
}
