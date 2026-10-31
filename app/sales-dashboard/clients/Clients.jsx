
"use client";

import ExecutiveClientList from "@/components/sales-dashboard/auth-role/executive/client/ExecutiveClientList";
import SrClientList from "@/components/sales-dashboard/auth-role/sr-manager/client/SrClientList";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { Users, UsersRound, LoaderCircle } from "lucide-react";

const Clients = () => {
  const { employee, loading } = useSalesEmployeeStore();

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F4F9] p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[22px] border border-[#E3E7F0] bg-white">
          <LoaderCircle
            size={34}
            className="animate-spin text-[#F27B1E]"
          />
          <p className="mt-4 text-sm font-medium text-[#5B6478]">
            Loading your clients...
          </p>
        </div>
      </main>
    );
  }

  // Read the role from whichever employee fields are available.
  const roles = [
    employee?.role,
    employee?.user?.role,
    employee?.basicDetails?.authRole,
  ]
    .filter(Boolean)
    .map((role) => String(role).toUpperCase());

  // Sales users, SR Managers, and Executives can view all clients.
  const canViewAllClients = [
    "SALES",
    "SR_MANAGER",
    "EXECUTIVE",
  ].some((role) => roles.includes(role));

  return (
    <main className="min-h-screen space-y-6 bg-[#bbd0ff] p-3 sm:p-5 lg:p-7">
      {/* Page heading */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#044cdc] text-[#01050b]">
            <UsersRound size={25} strokeWidth={1.9} />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1B33] sm:text-4xl">
              Clients
            </h1>
            <p className="mt-1 text-sm text-[#68738A] sm:text-base">
              Manage your client relationships and explore client records.
            </p>
          </div>
        </div>
      </header>

      {/* Client tabs and content */}
      <Tabs defaultValue="myCLients" className="w-full">
        <div className="rounded-[22px] border border-[#E3E7F0] bg-white p-3 shadow-[0_4px_18px_rgba(15,27,51,0.04)] sm:p-5">
          {/* Tab navigation */}
          <div className="mb-5 flex flex-col gap-4 border-b border-[#E3E7F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F1B33]">
                Client directory
              </h2>
              <p className="mt-1 text-sm text-[#68738A]">
                Switch between your assigned clients and the full client list.
              </p>
            </div>

            <TabsList
              className={`grid h-12 w-full rounded-xl border border-[#E3E7F0] bg-[#F7F8FC] p-1 sm:w-fit ${
                canViewAllClients
                  ? "grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <TabsTrigger
                value="myCLients"
                className="flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#68738A] transition data-[state=active]:bg-white data-[state=active]:text-[#0A2E66] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#E3E7F0]"
              >
                <Users size={17} />
                My Clients
              </TabsTrigger>

              {canViewAllClients && (
                <TabsTrigger
                  value="allClients"
                  className="flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#68738A] transition data-[state=active]:bg-white data-[state=active]:text-[#0A2E66] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#E3E7F0]"
                >
                  <UsersRound size={17} />
                  All Clients
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* My clients */}
          <TabsContent
            value="myCLients"
            className="mt-0 min-w-0 focus-visible:outline-none"
          >
            <ExecutiveClientList />
          </TabsContent>

          {/* All clients */}
          {canViewAllClients && (
            <TabsContent
              value="allClients"
              className="mt-0 min-w-0 focus-visible:outline-none"
            >
              <SrClientList />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </main>
  );
};

export default Clients;
