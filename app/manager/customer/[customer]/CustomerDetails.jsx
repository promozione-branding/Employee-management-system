"use client";

import React from "react";
import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryPage from "../history/page";
import Attachment from "@/components/admin-dashboard/tabs/Attachment";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab"; // 👈 shared component

export default function CustomerDetails({ customerId, salesPersonId }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="newproposal">New Proposal</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="meetingHistory">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
        </TabsList>

        <TabsContent value="Customer">
          <Customer customerId={customerId} />
        </TabsContent>

        <TabsContent value="newproposal">
          <ProposalTabNew customerId={customerId} />
        </TabsContent>

        <TabsContent value="meeting">
          <UpdateTab
            customerId={customerId}
            salesPersonId={salesPersonId}
          />
        </TabsContent>

        <TabsContent value="meetingHistory">
          <HistoryPage customerId={customerId} />
        </TabsContent>

        <TabsContent value="attachment">
          <Attachment clientId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
