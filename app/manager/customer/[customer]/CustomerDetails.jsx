
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryPage from "../history/page";
import Attachment from "@/components/admin-dashboard/tabs/Attachment";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";

const VALID_TABS = [
  "Customer",
  "newproposal",
  "meeting",
  "meetingHistory",
  "attachment",
];

function CustomerDetailsContent({ customerId, salesPersonId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(requestedTab)
    ? requestedTab
    : "Customer";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Keep the selected tab synchronized with URL changes,
  // including browser back/forward navigation.
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("Customer");
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    if (!VALID_TABS.includes(tab)) return;

    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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

export default function CustomerDetails({ customerId, salesPersonId }) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">
          Loading Customer Details...
        </div>
      }
    >
      <CustomerDetailsContent
        customerId={customerId}
        salesPersonId={salesPersonId}
      />
    </Suspense>
  );
}
