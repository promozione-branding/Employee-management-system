"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import UpdateTab from "@/components/sales-dashboard/activity/UpdateTab";
import CustomerTab from "@/components/sales-dashboard/activity/CustomerTab";
import ProposalTab from "@/components/sales-dashboard/activity/ProposalTab";

const Activity = () => {
  const { employee } = useSalesEmployeeStore();

  console.log(employee, "employee");

  return (
    <div>
      <Tabs defaultValue="updates" className="">
        <TabsList>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
        </TabsList>
        <TabsContent value="updates">
          <UpdateTab userId={employee?.user?._id} />
        </TabsContent>
        <TabsContent value="customer">
          <CustomerTab employeeId={employee?._id} />
        </TabsContent>
        <TabsContent value="proposal">
          <ProposalTab employeeId={employee?._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activity;
