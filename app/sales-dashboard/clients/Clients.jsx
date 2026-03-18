"use client";

import ExecutiveClientList from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveClientList";
import SrClientList from "@/components/sales-dashboard/auth-role/sr-manager/client/SrClientList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const Clients = () => {
  const { employee, loading } = useSalesEmployeeStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  const srManager = employee?.basicDetails?.authRole === "SR_MANAGER";

  return (
    <Tabs defaultValue={srManager ? "allClients" : "myCLients"} className="">
      <TabsList>
        {srManager && <TabsTrigger value="allClients">All Client</TabsTrigger>}
        <TabsTrigger value="myCLients">My Client</TabsTrigger>
      </TabsList>
      <TabsContent value="allClients">
        <SrClientList />
      </TabsContent>
      <TabsContent value="myCLients">
        <ExecutiveClientList />
      </TabsContent>
    </Tabs>
  );
};

export default Clients;
