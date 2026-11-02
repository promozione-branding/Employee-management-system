// app/sales-dashboard/clients/[clientId]/[salesPersonId]/ClientDetails.jsx

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function ClientDetailsContent({ customerId, salesPersonId, customerName, companyName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setActiveCustomer } = useActiveCustomerStore();

  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(requestedTab) ? requestedTab : "Customer";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch customer details and sync them with the top Navbar store
  useEffect(() => {
    let cancelled = false;

    const fetchCustomerDetails = async () => {
      if (!customerId) return;

      try {
        const response = await getCustomerServices(customerId);

        if (!cancelled && response?.success && response?.data) {
          const fetchedData = {
            ...response.data,
            name: response.data.name || customerName || "",
            company: response.data.company || companyName || "",
          };
          setActiveCustomer(fetchedData);
        }
      } catch (error) {
        console.error("Failed to fetch client details:", error);
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

  // Synchronize tab with URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("Customer");
    }
  }, [searchParams]);

  const handleTabChange = (value) => {
    if (!VALID_TABS.includes(value)) return;
    setActiveTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(
      `/sales-dashboard/clients/${customerId}/${salesPersonId}?${params.toString()}`,
      { scroll: false }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F4F9] p-1 sm:p-1 lg:p-1">
      <div className="mx-auto w-full max-w-[1800px]">
        <section className="w-full min-w-0 rounded-xl border border-[#E3E7F0] bg-white shadow-sm">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
            {/* Sticky Tabs Navigation Bar locked cleanly at the top */}
            <div
              className="
                sticky top-0 z-40 rounded-t-xl border-b border-[#E3E7F0]
                bg-white px-3 py-3 sm:px-4 shadow-md
              "
            >
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

            {/* Tab Contents */}
            <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
              <TabsContent value="Customer" className="mt-0 min-w-0 outline-none">
                <CustomerTab customerId={customerId} salesPersonId={salesPersonId} />
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
                <ProposalTab customerId={customerId} salesPersonId={salesPersonId} />
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