"use client";

import ClientDetailTab from "@/components/employee-dashboard/tabs/ClientDetailTab";
import TeamUpdateTab from "@/components/employee-dashboard/tabs/TeamUpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import WorkProgressTab from "@/components/employee-dashboard/tabs/WorkProgressTab";
import AllHistory from "@/components/employee-dashboard/tabs/AllHistory";

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
         {/* <WorkProgressTab customerId={clientId}/> */}
         <AllHistory customerId={clientId}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
