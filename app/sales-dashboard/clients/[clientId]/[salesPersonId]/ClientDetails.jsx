
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ExecutiveAttachment from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveAttachment";
import CustomerTab from "@/components/sales-dashboard/client/CustomerTab";
import HistoryTab from "@/components/sales-dashboard/client/HistoryTab";
import ProposalTab from "@/components/sales-dashboard/client/ProposalTab";
import UpdateTab from "@/components/sales-dashboard/client/UpdateTab";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const DEFAULT_TAB = "Customer";

const VALID_TABS = [
  "Customer",
  "newproposal",
  "meeting",
  "history",
  "attachment",
  "proposal",
];

const ClientDetails = ({ customerId, salesPersonId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabFromUrl)
    ? tabFromUrl
    : DEFAULT_TAB;

  const [tab, setTab] = useState(activeTab);

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (value) => {
    setTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(
      `/sales-dashboard/clients/${customerId}/${salesPersonId}?${params.toString()}`,
      { scroll: false }
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="newproposal">New Proposal</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
        </TabsList>

        <TabsContent value="Customer">
          <CustomerTab
            customerId={customerId}
            salesPersonId={salesPersonId}
          />
        </TabsContent>

        <TabsContent value="newproposal">
          <ProposalTabNew customerId={customerId} />
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

        <TabsContent value="proposal">
          <ProposalTab
            customerId={customerId}
            salesPersonId={salesPersonId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
