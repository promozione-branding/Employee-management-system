"use client";

import ExecutiveClientList from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveClientList";
import SrClientList from "@/components/sales-dashboard/auth-role/sr-manager/client/SrClientList";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const Clients = () => {
  const { employee, loading } = useSalesEmployeeStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  
  // here is the main
  if (employee?.basicDetails?.authRole === "SR_MANAGER") {
    return <SrClientList />;
  }

  return <ExecutiveClientList />
};

export default Clients;
