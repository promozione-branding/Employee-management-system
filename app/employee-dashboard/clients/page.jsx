"use client";
import ClientListExecutive from "@/components/employee-dashboard/authRole/executive/client/ClientListExecutive";
import ClientListSr from "@/components/employee-dashboard/authRole/sr-manager/client/ClientListSr";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const ClientsPage = () => {
  const { employee } = useEmployeeStore();

  if (employee?.basicDetails?.authRole === "SR_MANAGER") {
    return <ClientListSr />
  }

  return <ClientListExecutive />
};

export default ClientsPage;
