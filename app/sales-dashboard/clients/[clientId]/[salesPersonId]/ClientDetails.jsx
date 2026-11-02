// app/sales-dashboard/clients/[clientId]/[salesPersonId]/ClientDetails.jsx

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCustomerServices } from "@/service/customer";
import { useActiveCustomerStore } from "@/lib/store/ActiveCustomerStore";

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

import {
  UserRound,
  FileText,
  ClipboardList,
  History,
  Paperclip,
  Files,
  ArrowLeft,
} from "lucide-react";

const CUSTOMER_TABS = [
  { value: "Customer", label: "Customer", icon: UserRound },
  { value: "newproposal", label: "New Proposal", icon: FileText },
  { value: "meeting", label: "Update", icon: ClipboardList },
  { value: "history", label: "History", icon: History },
  { value: "attachment", label: "Attachment", icon: Paperclip },
  { value: "proposal", label: "Proposal", icon: Files },
];

const VALID_TABS = CUSTOMER_TABS.map((tab) => tab.value);

function ClientDetailsContent({
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
    !customerName || !companyName
  );

  const [activeTab, setActiveTab] = useState(() =>
    VALID_TABS.includes(requestedTab) ? requestedTab : "Customer"
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
        console.error("Failed to fetch client details:", error);
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
    const nextTab = VALID_TABS.includes(requestedTab)
      ? requestedTab
      : "Customer";

    setActiveTab(nextTab);
  }, [requestedTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(
      `/sales-dashboard/clients/${customerId}/${salesPersonId}?${params.toString()}`,
      { scroll: false }
    );
  };

  const displayedCustomerName =
    customerDetails?.name || customerName || "";

  const displayedCompanyName =
    customerDetails?.company || companyName || "";

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
                    href="/sales-dashboard/clients"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#0A2E66] transition-colors hover:bg-[#EAF0FA] hover:text-[#F27B1E]"
                    title="Back to Clients"
                    aria-label="Back to Clients"
                  >
                    <ArrowLeft size={18} strokeWidth={2.2} />
                  </Link>

                  <span className="hidden h-6 w-1 shrink-0 rounded-full bg-[#F27B1E] sm:block" />

                  <h1 className="truncate text-sm font-bold text-[#0A2E66] sm:text-base">
                    Client Workspace
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
                        (customerLoading ? "Loading..." : "Client")}
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

              {/* Tabs list */}
              <TabsList
                className="
                  flex h-auto w-full flex-nowrap items-stretch
                  justify-start gap-1 overflow-x-auto overflow-y-hidden
                  rounded-lg border border-[#E3E7F0]
                  bg-[#F2F4F9] p-1 whitespace-nowrap
                  [scrollbar-width:thin]
                "
              >
                {CUSTOMER_TABS.map(
                  ({ value, label, icon: Icon }) => (
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
                  )
                )}
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
              <TabsContent value="Customer" className="mt-0 min-w-0 outline-none">
                <CustomerTab
                  customerId={customerId}
                  salesPersonId={salesPersonId}
                />
              </TabsContent>

              <TabsContent value="newproposal" className="mt-0 min-w-0 outline-none">
                <ProposalTabNew customerId={customerId} />
              </TabsContent>

              <TabsContent value="meeting" className="mt-0 min-w-0 outline-none">
                <UpdateTab customerId={customerId} />
              </TabsContent>

              <TabsContent value="history" className="mt-0 min-w-0 outline-none">
                <HistoryTab customerId={customerId} />
              </TabsContent>

              <TabsContent value="attachment" className="mt-0 min-w-0 outline-none">
                <ExecutiveAttachment clientId={customerId} />
              </TabsContent>

              <TabsContent value="proposal" className="mt-0 min-w-0 outline-none">
                <ProposalTab
                  customerId={customerId}
                  salesPersonId={salesPersonId}
                />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

export default function ClientDetails({ customerId, salesPersonId, customerName, companyName }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[30vh] items-center justify-center bg-[#F2F4F9] p-6">
          <div className="flex items-center gap-3 rounded-xl border border-[#E3E7F0] bg-white px-5 py-4 shadow-sm">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#DCE5F5] border-t-[#F27B1E]" />

            <span className="text-sm font-medium text-[#5B6478]">
              Loading client details...
            </span>
          </div>
        </div>
      }
    >
      <ClientDetailsContent
        customerId={customerId}
        salesPersonId={salesPersonId}
        customerName={customerName}
        companyName={companyName}
      />
    </Suspense>
  );
}