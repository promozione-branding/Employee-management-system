// app/sales-dashboard/clients/Clients.jsx


// app/sales-dashboard/clients/Clients.jsx

"use client";

import ExecutiveClientList from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveClientList";
import SrClientList from "@/components/sales-dashboard/auth-role/sr-manager/client/SrClientList";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const Clients = () => {
  const { employee, loading } = useSalesEmployeeStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Read the role from whichever user/employee fields are available.
  const roles = [
    employee?.role,
    employee?.user?.role,
    employee?.basicDetails?.authRole,
  ]
    .filter(Boolean)
    .map((role) => String(role).toUpperCase());

  // Sales users, SR Managers, and Executives can view all clients.
  const canViewAllClients = [
    "SALES",
    "SR_MANAGER",
    "EXECUTIVE",
  ].some((role) => roles.includes(role));

  return (
    <Tabs defaultValue="myCLients" className="w-full">
      <TabsList>
        <TabsTrigger value="myCLients">
          My Clients
        </TabsTrigger>
        {canViewAllClients && (
          <TabsTrigger value="allClients">
            All Clients
          </TabsTrigger>
        )}

        
      </TabsList>

      {canViewAllClients && (
        <TabsContent value="allClients">
          <SrClientList />
        </TabsContent>
      )}

      <TabsContent value="myCLients">
        <ExecutiveClientList />
      </TabsContent>
    </Tabs>
  );
};

export default Clients;
