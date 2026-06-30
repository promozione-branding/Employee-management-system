"use client";
import SalesCustomerTab from "@/components/admin-dashboard/employee/sales-work/SalesCustomerTab";
import SalesProposalTab from "@/components/admin-dashboard/employee/sales-work/SalesProposalTab";
import SalesUpdateTab from "@/components/admin-dashboard/employee/sales-work/SalesUpdateTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

const SalesTask = ({ employeeId }) => {
  return (
    <div>
      <Tabs defaultValue="updates" className="">
        <TabsList>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
        </TabsList>
        <TabsContent value="updates">
          <SalesUpdateTab employeeId={employeeId} />
        </TabsContent>
        <TabsContent value="customer">
          <SalesCustomerTab employeeId={employeeId} />
        </TabsContent>
        <TabsContent value="proposal">
          <SalesProposalTab employeeId={employeeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesTask;
