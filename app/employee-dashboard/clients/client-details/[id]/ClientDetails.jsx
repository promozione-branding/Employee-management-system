"use client";

import ClientDetailTab from "@/components/employee-dashboard/tabs/ClientDetailTab";
import TeamUpdateTab from "@/components/employee-dashboard/tabs/TeamUpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import WorkProgressTab from "@/components/employee-dashboard/tabs/WorkProgressTab";
import AllHistory from "@/components/employee-dashboard/tabs/AllHistory";
import Attachment from "@/components/employee-dashboard/tabs/Attachment";

const ClientDetails = ({ clientId }) => {
  return (
    <div>
      <Tabs defaultValue="client">
        <TabsList>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="update">Update</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
        </TabsList>
        <TabsContent value="client">
          <ClientDetailTab clientId={clientId} />
        </TabsContent>
        <TabsContent value="update">
          <TeamUpdateTab clientId={clientId} />
        </TabsContent>
        <TabsContent value="history">
         <AllHistory customerId={clientId}/>
        </TabsContent>
        <TabsContent value="attachment">
         <Attachment clientId={clientId}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
