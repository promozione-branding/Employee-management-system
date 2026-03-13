"use client";

import ClientDetailTab from "@/components/employee-dashboard/tabs/ClientDetailTab";
import TeamUpdateTab from "@/components/employee-dashboard/tabs/TeamUpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkProgressTab from "@/components/employee-dashboard/tabs/WorkProgressTab";

const ClientDetails = ({ clientId }) => {
  return (
    <div>
      <Tabs defaultValue="client">
        <TabsList>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="update">Update</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="client">
          <ClientDetailTab clientId={clientId} />
        </TabsContent>
        <TabsContent value="update">
          <TeamUpdateTab clientId={clientId} />
        </TabsContent>
        <TabsContent value="history">
         <WorkProgressTab customerId={clientId}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
