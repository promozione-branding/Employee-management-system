"use client";

import Layout, { EmployeeProvider } from "@/components/layout/sales-dashboard/Layout";

export const dynamic = "force-dynamic";

export default function SalesDashboardLayout({ children }) {
  return (
    <EmployeeProvider>
      <Layout>{children}</Layout>
    </EmployeeProvider>
  );
}
