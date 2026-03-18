"use client";

import ClientListExecutive from "@/components/employee-dashboard/authRole/executive/client/ClientListExecutive";
import ClientListSr from "@/components/employee-dashboard/authRole/sr-manager/client/ClientListSr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const ClientsPage = () => {
  const { employee } = useEmployeeStore();

  const srManager = employee?.basicDetails?.authRole === "SR_MANAGER";

  return (
    <Tabs defaultValue={srManager ? "allCLients" : "myCLients"}>
      <TabsList>
        {srManager && <TabsTrigger value="allCLients">All Client</TabsTrigger>}
        <TabsTrigger value="myCLients">My Client</TabsTrigger>
      </TabsList>

      {srManager && (
        <TabsContent value="allCLients">
          <ClientListSr />
        </TabsContent>
      )}

      <TabsContent value="myCLients">
        <ClientListExecutive />
      </TabsContent>
    </Tabs>
  );
};

export default ClientsPage;
