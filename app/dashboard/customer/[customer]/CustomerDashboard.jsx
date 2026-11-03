// app/dashboard/customer/[customer]/CustomerDashboard.jsx

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCustomerServices } from "@/service/customer";
import { createWorkflowService } from "@/service/workflow";
import { useActiveCustomerStore } from "@/lib/store/ActiveCustomerStore";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  UserRound,
  FileText,
  Receipt,
  BookOpen,
  Workflow,
  ClipboardList,
  History,
  Paperclip,
  Files,
  Wallet,
  ArrowLeft,
} from "lucide-react";

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

const CUSTOMER_TABS = [
  { value: "Customer", label: "Customer", icon: UserRound },
  { value: "newproposal", label: "New Proposal", icon: FileText },
  { value: "invoice", label: "Invoice", icon: Receipt },
  { value: "newledger", label: "New Ledger", icon: BookOpen },
  { value: "createworkflow", label: "Create Workflow", icon: Workflow },
  { value: "meeting", label: "Update", icon: ClipboardList },
  { value: "meetingHistory", label: "History", icon: History },
  { value: "attachment", label: "Attachment", icon: Paperclip },
  { value: "proposal", label: "Proposal", icon: Files },
  { value: "ledger", label: "Ledger", icon: Wallet },
];

function DashboardContent({
  customerId,
  salesPersonId,
  customerName,
  companyName,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setActiveCustomer } = useActiveCustomerStore();

  const requestedTab = searchParams.get("tab");

  const [customerDetails, setCustomerDetails] = useState({
    name: customerName || "",
    company: companyName || "",
  });

  const [customerLoading, setCustomerLoading] = useState(
    !customerName || !companyName,
  );

  const [activeTab, setActiveTab] = useState(() =>
    CUSTOMER_TABS.some((tab) => tab.value === requestedTab)
      ? requestedTab
      : "Customer",
  );

  // Fetch customer information.
  useEffect(() => {
    let cancelled = false;

    const fetchCustomerDetails = async () => {
      if (!customerId) {
        setCustomerLoading(false);
        return;
      }

      try {
        const response = await getCustomerServices(customerId);

        if (!cancelled && response?.success && response?.data) {
          const fetchedData = {
            ...response.data,
            name: response.data.name || customerName || "",
            company: response.data.company || companyName || "",
          };
          setCustomerDetails(fetchedData);
          setActiveCustomer(fetchedData);
        }
      } catch (error) {
        console.error("Failed to fetch customer details:", error);
      } finally {
        if (!cancelled) {
          setCustomerLoading(false);
        }
      }
    };

    fetchCustomerDetails();

    return () => {
      cancelled = true;
    };
  }, [customerId, customerName, companyName, setActiveCustomer]);

  // Set initial fallback to store if props exist
  useEffect(() => {
    if (customerName || companyName) {
      setActiveCustomer({ name: customerName, company: companyName });
    }
  }, [customerName, companyName, setActiveCustomer]);

  // Keep the selected tab synchronized with the URL.
  useEffect(() => {
    const nextTab = CUSTOMER_TABS.some((tab) => tab.value === requestedTab)
      ? requestedTab
      : "Customer";

    setActiveTab(nextTab);
  }, [requestedTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const displayedCustomerName = customerDetails?.name || customerName || "";

  const displayedCompanyName = customerDetails?.company || companyName || "";

  return (
    <div className="min-h-screen w-full bg-[#F2F4F9] p-1 sm:p-1 lg:p-1">
      <div className="mx-auto w-full max-w-[1800px]">
        <section className="w-full min-w-0 rounded-xl border border-[#E3E7F0] bg-white shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full min-w-0"
          >
            {/* Compact header and sticky navigation */}
            <div
              className="
                relative z-30 rounded-t-xl border-b border-[#E3E7F0]
                bg-white px-3 py-2.5 sm:px-4
                lg:sticky lg:top-0
              "
            >
              {/* Information header */}
              <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                {/* Back arrow and dashboard title */}
                <div className="flex min-w-0 items-center gap-2">
                  <Link
                    href="/dashboard/customer"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#0A2E66] transition-colors hover:bg-[#EAF0FA] hover:text-[#F27B1E]"
                    title="Back to Customer Dashboard"
                    aria-label="Back to Customer Dashboard"
                  >
                    <ArrowLeft size={18} strokeWidth={2.2} />
                  </Link>

                  <span className="hidden h-6 w-1 shrink-0 rounded-full bg-[#F27B1E] sm:block" />

                  <h1 className="truncate text-sm font-bold text-[#0A2E66] sm:text-base">
                    Customer Dashboard
                  </h1>
                </div>

                {/* Customer and company details */}
                <div className="flex min-w-0 max-w-[65%] items-center gap-1.5 sm:gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E4] text-[#F27B1E]">
                    <UserRound size={14} />
                  </span>

                  <div className="min-w-0">
                    <p
                      title={displayedCustomerName}
                      className="truncate text-xs font-semibold text-[#0A2E66] sm:text-sm"
                    >
                      {displayedCustomerName ||
                        (customerLoading ? "Loading..." : "Customer")}
                    </p>

                    <p
                      title={displayedCompanyName}
                      className="truncate text-[10px] text-[#697386] sm:text-xs"
                    >
                      {displayedCompanyName ||
                        (customerLoading
                          ? "Loading company..."
                          : "Company unavailable")}
                    </p>
                  </div>
                </div>
              </div>

              {/* All 10 tabs in one horizontal line */}
              <TabsList
                className="
                  flex h-auto w-full flex-nowrap items-stretch
                  justify-start gap-1 overflow-x-auto overflow-y-hidden
                  rounded-lg border border-[#E3E7F0]
                  bg-[#F2F4F9] p-1 whitespace-nowrap
                  [scrollbar-width:thin]
                "
              >
                {CUSTOMER_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="
                        relative flex min-h-9 flex-none
                        items-center justify-center gap-1.5
                        whitespace-nowrap rounded-md
                        border border-transparent px-2.5 py-2
                        text-xs font-semibold
                        text-[#5B6478] transition-colors
                        hover:bg-white hover:text-[#0A2E66]
                        data-[state=active]:border-[#DCE5F5]
                        data-[state=active]:bg-white
                        data-[state=active]:text-[#0A2E66]
                        data-[state=active]:shadow-sm
                      "
                  >
                    <Icon size={14} className="shrink-0" />

                    <span>{label}</span>

                    {activeTab === value && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#F27B1E]" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
              <TabsContent
                value="Customer"
                className="mt-0 min-w-0 outline-none"
              >
                <Customer customerId={customerId} />
              </TabsContent>

              <TabsContent
                value="newproposal"
                className="mt-0 min-w-0 outline-none"
              >
                <ProposalTabNew customerId={customerId} />
              </TabsContent>

              <TabsContent
                value="invoice"
                className="mt-0 min-w-0 outline-none"
              >
                <AllInvoice customerId={customerId} />
              </TabsContent>

              <TabsContent
                value="newledger"
                className="mt-0 min-w-0 outline-none"
              >
                <LedgerTabNew customerId={customerId} />
              </TabsContent>

              <TabsContent
                value="createworkflow"
                className="mt-0 min-w-0 outline-none"
              >
                <Createworkflow
                  customerId={customerId}
                  onSave={async (payload) => {
                    const res = await createWorkflowService(payload);
                    return res.data;
                  }}
                />
              </TabsContent>

              <TabsContent
                value="meeting"
                className="mt-0 min-w-0 outline-none"
              >
                <UpdateTab
                  customerId={customerId}
                  salesPersonId={salesPersonId}
                />
              </TabsContent>

              <TabsContent
                value="meetingHistory"
                className="mt-0 min-w-0 outline-none"
              >
                <HistoryPage customerId={customerId} />
              </TabsContent>

              <TabsContent
                value="attachment"
                className="mt-0 min-w-0 outline-none"
              >
                <Attachment clientId={customerId} />
              </TabsContent>

              <TabsContent
                value="proposal"
                className="mt-0 min-w-0 outline-none"
              >
                <CustomerProposal customerId={customerId} />
              </TabsContent>

              <TabsContent value="ledger" className="mt-0 min-w-0 outline-none">
                <LedgerDetails customerId={customerId} />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

export default function CustomerDashboard({
  customerId,
  salesPersonId,
  customerName,
  companyName,
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[30vh] items-center justify-center bg-[#F2F4F9] p-6">
          <div className="flex items-center gap-3 rounded-xl border border-[#E3E7F0] bg-white px-5 py-4 shadow-sm">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#DCE5F5] border-t-[#F27B1E]" />

            <span className="text-sm font-medium text-[#5B6478]">
              Loading customer dashboard...
            </span>
          </div>
        </div>
      }
    >
      <DashboardContent
        customerId={customerId}
        salesPersonId={salesPersonId}
        customerName={customerName}
        companyName={companyName}
      />
    </Suspense>
  );
}
