// app/sales-dashboard/clients/[clientId]/[salesPersonId]/ClientDetails.jsx

"use client";

import React from "react";
import ExecutiveAttachment from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveAttachment";
import CustomerTab from "@/components/sales-dashboard/client/CustomerTab";
import HistoryTab from "@/components/sales-dashboard/client/HistoryTab";
import ProposalTab from "@/components/sales-dashboard/client/ProposalTab";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientDetails = ({ customerId, salesPersonId }) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
          
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="newproposal">New Proposal</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
        </TabsList>
        

        <TabsContent value="Customer">
          <CustomerTab customerId={customerId} salesPersonId={salesPersonId} />
        </TabsContent>

        <TabsContent value="newproposal">
          <ProposalTabNew customerId={customerId} />
        </TabsContent>

        <TabsContent value="proposal">
          <ProposalTab customerId={customerId} salesPersonId={salesPersonId} />
        </TabsContent>
        <TabsContent value="meeting">
          <UpdateTab customerId={customerId} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab customerId={customerId} />
        </TabsContent> 
        <TabsContent value="attachment">
          <ExecutiveAttachment clientId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
