import React from "react";
import ClientWork from "./Work";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesWork from "./SalesWork";

const page = async ({ params }) => {
  const { id } = await params;

  return (
    <Tabs defaultValue="operation">
      <TabsList>
        <TabsTrigger value="operation">Operation</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
      </TabsList>
      <TabsContent value="operation">
        <ClientWork customerId={id} />
      </TabsContent>
      <TabsContent value="sales">
        <SalesWork customerId={id} />
      </TabsContent>
    </Tabs>
  );
};

export default page;
