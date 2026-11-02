
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getCustomerServices } from "@/service/customer";
import { createWorkflowService } from "@/service/workflow";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  ChevronRight,
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

  const requestedTab = searchParams.get("tab");

  const [customerDetails, setCustomerDetails] = useState({
    name: customerName || "",
    company: companyName || "",
  });

  const [customerLoading, setCustomerLoading] = useState(
    !customerName || !companyName
  );

  const [activeTab, setActiveTab] = useState(() =>
    CUSTOMER_TABS.some((tab) => tab.value === requestedTab)
      ? requestedTab
      : "Customer"
  );

  // Fetch the actual customer details for the dashboard header.
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
          setCustomerDetails({
            ...response.data,
            name: response.data.name || customerName || "",
            company: response.data.company || companyName || "",
          });
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
  }, [customerId, customerName, companyName]);

  // Keep the active tab synchronized with the URL.
  useEffect(() => {
    const nextTab = CUSTOMER_TABS.some(
      (tab) => tab.value === requestedTab
    )
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

  const displayedCustomerName =
    customerDetails?.name || customerName || "";

  const displayedCompanyName =
    customerDetails?.company || companyName || "";

  return (
    <div className="min-h-screen w-full bg-[#F2F4F9] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-5">
        {/* Page heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#8A92A6]">
              <span>Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-[#2B5086]">
                Customer Management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0A2E66] sm:text-3xl">
              Customer Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#5B6478]">
              Manage customer information, proposals, invoices, work,
              and account history.
            </p>
          </div>

          {/* Customer and company details */}
          <div className="flex min-w-0 max-w-full items-center gap-3 rounded-xl border border-[#E3E7F0] bg-white px-3 py-2.5 shadow-sm sm:max-w-[340px]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E4] text-[#F27B1E]">
              <UserRound size={18} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                title={displayedCustomerName}
                className="truncate text-sm font-semibold text-[#0A2E66]"
              >
                {displayedCustomerName ||
                  (customerLoading
                    ? "Loading customer..."
                    : "Customer")}
              </p>

              <p
                title={displayedCompanyName}
                className="truncate text-xs text-[#5B6478]"
              >
                {displayedCompanyName ||
                  (customerLoading
                    ? "Loading company..."
                    : "Company not available")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer workspace */}
        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full min-w-0"
          >
            {/* Compact, responsive tab navigation */}
            <div className="border-b border-[#E3E7F0] px-3 pt-3 sm:px-5 sm:pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0F1B33] sm:text-base">
                    Workspace
                  </h2>

                  <p className="mt-0.5 text-xs text-[#8A92A6]">
                    Select a section to manage its details.
                  </p>
                </div>

                <span className="hidden shrink-0 rounded-lg bg-[#E9EFF9] px-3 py-1.5 text-xs font-semibold text-[#0A2E66] sm:inline-flex">
                  {
                    CUSTOMER_TABS.find(
                      (tab) => tab.value === activeTab
                    )?.label
                  }
                </span>
              </div>

              <TabsList
                className="
                  grid h-auto w-full grid-cols-2
                  gap-1.5 rounded-xl border border-[#E3E7F0]
                  bg-[#F2F4F9] p-1.5
                  sm:grid-cols-3
                  lg:grid-cols-5
                "
              >
                {CUSTOMER_TABS.map(
                  ({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="
                        relative flex min-h-9 min-w-0 w-full
                        items-center justify-center gap-1.5
                        whitespace-normal break-words
                        rounded-lg border border-transparent
                        px-1.5 py-1.5 text-center
                        text-[11px] font-semibold leading-tight
                        text-[#5B6478] transition-colors
                        hover:bg-white hover:text-[#0A2E66]
                        data-[state=active]:border-[#DCE5F5]
                        data-[state=active]:bg-white
                        data-[state=active]:text-[#0A2E66]
                        data-[state=active]:shadow-sm
                        sm:gap-2 sm:px-2 sm:py-2 sm:text-xs
                        xl:text-sm
                      "
                    >
                      <Icon size={14} className="shrink-0" />

                      <span className="min-w-0">{label}</span>

                      {activeTab === value && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#F27B1E]" />
                      )}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="w-full min-w-0 p-3 sm:p-5 lg:p-6">
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

              <TabsContent
                value="ledger"
                className="mt-0 min-w-0 outline-none"
              >
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
        <div className="flex min-h-[40vh] items-center justify-center bg-[#F2F4F9] p-6">
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
