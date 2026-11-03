// app/sales-dashboard/activity/Activity.jsx

"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import UpdateTab from "@/components/sales-dashboard/activity/UpdateTab";
import CustomerTab from "@/components/sales-dashboard/activity/CustomerTab";
import ProposalTab from "@/components/sales-dashboard/activity/ProposalTab";
import { ClipboardList, UsersRound, FileText } from "lucide-react";

const ACTIVITY_TABS = [
  { value: "updates", label: "Updates", icon: ClipboardList },
  { value: "customer", label: "Customer", icon: UsersRound },
  { value: "proposal", label: "Proposal", icon: FileText },
];

const VALID_TABS = ACTIVITY_TABS.map((tab) => tab.value);

const Activity = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { employee } = useSalesEmployeeStore();

  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(requestedTab) ? requestedTab : "updates";

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value) => {
    if (!VALID_TABS.includes(value)) return;
    setActiveTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(`/sales-dashboard/activity?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F4F9] p-1 sm:p-1 lg:p-1">
      <div className="mx-auto w-full max-w-[1800px]">
        <section className="w-full min-w-0 rounded-xl border border-[#E3E7F0] bg-white shadow-sm">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
            {/* Sticky Tabs Navigation Bar */}
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
                {ACTIVITY_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="
                      relative flex min-h-9 flex-none
                      items-center justify-center gap-1.5
                      whitespace-nowrap rounded-md
                      border border-transparent px-3 py-2
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
              <TabsContent value="updates" className="mt-0 min-w-0 outline-none">
                <UpdateTab userId={employee?.user?._id} />
              </TabsContent>

              <TabsContent value="customer" className="mt-0 min-w-0 outline-none">
                <CustomerTab employeeId={employee?.user?._id} />
              </TabsContent>

              <TabsContent value="proposal" className="mt-0 min-w-0 outline-none">
                <ProposalTab employeeId={employee?.user?._id} />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default Activity;