"use client";

import React, { useEffect, useState } from "react";
import CustomerProposal from "../CustomerProposal";
import AllInvoice from "../invoice/AllInvoice";
import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LedgerDetails from "../ledger/LedgerDetails";
import MeetingDashboard from "../meeting/MeetingDashboard";
import HistoryPage from "../history/page";
import Attachment from "@/components/admin-dashboard/tabs/Attachment";
import CallPanel from "@/components/sales-dashboard/client/CallPanel";
import CallHistory from "@/components/sales-dashboard/client/CallHistory";
import { getCallHistoryService } from "@/service/calling";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";

const CustomerDashboard = ({ customerId, salesPersonId }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);

  const fetchCallHistory = async () => {
    if (!customerId) return;
    try {
      setCallHistoryLoading(true);
      const res = await getCallHistoryService(customerId, "all");
      if (res?.success) setCallHistory(res.data || []);
    } catch (err) {
      console.log("fetchCallHistory error:", err);
    } finally {
      setCallHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, [customerId]);

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="Customer">
        <TabsList>
          <TabsTrigger value="Customer">Customer</TabsTrigger>
          <TabsTrigger value="newproposal">New Proposal</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="meeting">Update</TabsTrigger>
          <TabsTrigger value="meetingHistory">History</TabsTrigger>
          <TabsTrigger value="attachment">Attachment</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
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
        <TabsContent value="proposal">
          <CustomerProposal customerId={customerId} />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerDetails customerId={customerId} />
        </TabsContent>
        <TabsContent value="meeting">
          <MeetingDashboard
            customerId={customerId}
            salesPersonId={salesPersonId}
          />
          <div className="mt-6">
            <CallPanel
              customerId={customerId}
              customerName="Customer"
              customerPhone="—"
              virtualNumber={process.env.NEXT_PUBLIC_MYOP_VIRTUAL_NUMBER || "—"}
              onCallStarted={() => setTimeout(fetchCallHistory, 2000)}
            />
            <div className="mb-5">
              {callHistoryLoading ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                  Loading call history…
                </div>
              ) : (
                <CallHistory calls={callHistory} />
              )}
            </div>
          </div>
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
};

export default CustomerDashboard;
