// app/manager/customer/[customer]/CustomerDetails.jsx

"use client";

import React, { useEffect, useState } from "react";
import Customer from "../Customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeetingDashboard from "../../../dashboard/customer/meeting/MeetingDashboard";
import HistoryPage from "../history/page";
import Attachment from "@/components/admin-dashboard/tabs/Attachment";
import ProposalTabNew from "@/components/proposalNew/ProposalTabNew";
import CallPanel from "@/components/sales-dashboard/client/CallPanel";
import CallHistory from "@/components/sales-dashboard/client/CallHistory";
import { getCallHistoryService } from "@/service/calling";

export default function CustomerDetails({ customerId, salesPersonId }) {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCallHistory = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await getCallHistoryService(customerId, "all");
      if (res.success) setCallHistory(res.data || []);
    } catch (err) {
      console.log("fetch call history error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

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

        {/* ✅ Update tab: Forms FIRST, then Call section below */}
        <TabsContent value="meeting">
          <div className="flex flex-col gap-5">
            {/* 1. Forms (Update section) */}
            <MeetingDashboard
              customerId={customerId}
              salesPersonId={salesPersonId}
            />

            {/* 2. Call Panel */}
            <CallPanel
              customerId={customerId}
              customerName="Customer"
              customerPhone="—"
              virtualNumber={
                process.env.NEXT_PUBLIC_MYOP_VIRTUAL_NUMBER || "—"
              }
              onCallStarted={() => {
                setTimeout(fetchCallHistory, 2000);
              }}
            />

            {/* 3. Call History */}
            <div>
              {loading ? (
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
}
