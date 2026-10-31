
// app/dashboard/customer/[customer]/CustomerDashboard.jsx

"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Customer from "../Customer";
import CustomerProposal from "../CustomerProposal";
import AllInvoice from "../invoice/AllInvoice";
import LedgerDetails from "../ledger/LedgerDetails";
import HistoryPage from "../history/page";

import Attachment from "@/components/admin-dashboard/tabs/Attachment";
import Createworkflow from "@/components/admin-dashboard/tabs/Createworkflow";

import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";
import LedgerTabNew from "@/components/proposalNew/LedgerTabNew";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";

import { createWorkflowService } from "@/service/workflow";

function DashboardContent({ customerId, salesPersonId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Customer"
  );

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.replace(`?tab=${value}`);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="newproposal">New Proposal</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="newledger">New Ledger</TabsTrigger>
          <TabsTrigger value="createworkflow">Create Workflow</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="meetingHistory">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="Customer">
          <Customer customerId={customerId} />
        </TabsContent>

        <TabsContent value="newproposal">
          <ProposalTabNew customerId={customerId} />
        </TabsContent>

        <TabsContent value="invoice">
          <AllInvoice customerId={customerId} />
        </TabsContent>

        <TabsContent value="newledger">
          <LedgerTabNew customerId={customerId} />
        </TabsContent>

        <TabsContent value="createworkflow">
          <Createworkflow
            customerId={customerId}
            onSave={async (payload) => {
              const res = await createWorkflowService(payload);
              return res.data;
            }}
          />
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

        <TabsContent value="proposal">
          <CustomerProposal customerId={customerId} />
        </TabsContent>

        <TabsContent value="ledger">
          <LedgerDetails customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CustomerDashboard({ customerId, salesPersonId }) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent
        customerId={customerId}
        salesPersonId={salesPersonId}
      />
    </Suspense>
  );
}
