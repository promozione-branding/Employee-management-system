// components/layout/sales-dashboard/SalesNavbar.jsx

"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  Sun,
  Moon,
  UserCircle,
  ChevronDown,
  UserRound,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/service/axiosInstance";
import ThemeToggle, { useTheme } from "@/components/layout/ThemeToggle";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { useActiveCustomerStore } from "@/lib/store/ActiveCustomerStore";

const SalesNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);

  const { employee, clearEmployee } = useSalesEmployeeStore();
  const { activeCustomer, clearActiveCustomer } = useActiveCustomerStore();
  const { theme, toggleTheme } = useTheme();
  const lightMode = theme !== "dark";

  // Clear active customer when not on a client detail page
  useEffect(() => {
    if (!pathname.includes("/sales-dashboard/clients/")) {
      clearActiveCustomer();
    }
  }, [pathname, clearActiveCustomer]);

  const username =
    employee?.basicDetails?.name ||
    employee?.basicDetails?.email?.split("@")[0] ||
    "Sales Employee";

  const email = Array.isArray(employee?.basicDetails?.email)
    ? employee?.basicDetails?.email[0]
    : employee?.basicDetails?.email || "admin2@promozionebranding.com";

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");

      clearEmployee();
      sessionStorage.removeItem("employeeData");

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  // Only show the back button if we are deeper than the root sales dashboard
  const showBackButton = pathname !== "/sales-dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-xl sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {/* Conditional Back Button */}
        {showBackButton && (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A2E66]"
              title="Go back"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </button>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          </>
        )}

        <h2 className="text-base font-bold tracking-tight text-[#0A2E66] sm:text-lg shrink-0">
          Sales Workspace
        </h2>

        {activeCustomer && (
          <>
            <span className="hidden h-5 w-px bg-slate-300 sm:block" />
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E4] text-[#F27B1E]">
                <UserRound size={14} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#0A2E66] sm:text-sm">
                  {activeCustomer.name}
                  {activeCustomer.company && (
                    <span className="font-normal text-slate-500">
                      {" "}
                      ({activeCustomer.company})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search pipeline..."
            className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2E66]/20"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#0A2E66] sm:flex"
        >
          <Bell size={19} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        </button>

        <div className="mx-0.5 hidden h-8 w-px bg-slate-200 sm:block" />

        {/* User Profile Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={openEmployeeDetails}
            aria-label="Toggle user menu"
            onClick={() => setOpenEmployeeDetails((p) => !p)}
            className={`flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:pl-2 ${
              openEmployeeDetails ? "bg-slate-50" : ""
            }`}
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-blue-50 text-[#0A2E66] ring-1 ring-blue-100">
              {employee?.basicDetails?.profileImage ? (
                <Image
                  fill
                  alt="employee"
                  className="object-cover"
                  src={employee.basicDetails.profileImage}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserCircle size={23} strokeWidth={1.8} />
                </div>
              )}
            </div>

            <div className="hidden max-w-36 text-left sm:block">
              <p className="truncate text-sm font-semibold capitalize text-slate-800">
                {username}
              </p>
              <p className="text-[11px] text-slate-500">Sales Representative</p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block ${
                openEmployeeDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {openEmployeeDetails && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpenEmployeeDetails(false)}
              />

              <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="bg-[#F2F4F9] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A2E66] shadow-sm">
                      <UserCircle size={25} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold capitalize text-slate-800">
                        {username}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    href="/sales-dashboard/profile"
                    onClick={() => setOpenEmployeeDetails(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-[#0A2E66]"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-[#0A2E66] cursor-pointer"
                    onClick={toggleTheme}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-5 w-5 flex items-center justify-center">
                        <Sun
                          size={18}
                          className={`absolute transition-all duration-300 ease-in-out ${
                            lightMode
                              ? "opacity-100 transform rotate-0 scale-100"
                              : "opacity-0 transform -rotate-90 scale-50"
                          }`}
                        />
                        <Moon
                          size={18}
                          className={`absolute transition-all duration-300 ease-in-out ${
                            lightMode
                              ? "opacity-0 transform rotate-90 scale-50"
                              : "opacity-100 transform rotate-0 scale-100"
                          }`}
                        />
                      </div>
                      <span>{lightMode ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SalesNavbar;
