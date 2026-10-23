// app/dashboard/customer/history/client-edithistory/[customerId]/page.jsx

"use client";

import React, { use } from "react";
import EditHistoryView from "@/components/customer-history/EditHistoryView";

export default function ClientEditHistoryPage({ params }) {
  // Next.js 15: params is a Promise — unwrap with React.use()
  const { customerId } = use(params);
  return <EditHistoryView customerId={customerId} />;
}
