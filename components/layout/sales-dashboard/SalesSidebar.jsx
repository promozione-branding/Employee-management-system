// components/layout/sales-dashboard/SalesSidebar.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import axiosInstance from "@/service/axiosInstance";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  CalendarCheck,
  UsersRound,
  CircleUserRound,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const NAV_LINKS = [
  {
    title: "Dashboard",
    href: "/sales-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Client",
    href: "/sales-dashboard/clients",
    label: "Client",
    icon: UsersRound,
  },
  {
    title: "Activity",
    href: "/sales-dashboard/activity",
    label: "Activity",
    icon: Activity,
  },
  {
    title: "Attendance",
    href: "https://hrms.inquirybazar.com",
    label: "Attendance",
    icon: CalendarCheck,
    external: true,
  },
  {
    href: "/sales-dashboard/profile",
    label: "Profile",
    icon: CircleUserRound,
  },
];

const SalesSidebar = () => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { clearEmployee } = useSalesEmployeeStore();

  const showLabels = open || mobileOpen;

  const isActive = (href) => {
    if (href.startsWith("http")) return false;

    if (href === "/sales-dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axiosInstance.get("/api/user/logout");

      clearEmployee();
      sessionStorage.removeItem("employeeData");

      toast.success("Logged out successfully");
      setMobileOpen(false);
      router.push("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E7F0] bg-white text-[#0A2E66] shadow-md transition hover:bg-blue-50 md:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        aria-label="Sales navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex h-dvh
          flex-col border-r border-white/10
          bg-[#0A2E66] text-white shadow-xl
          transition-[width,transform] duration-300 ease-in-out
          md:sticky md:top-0 md:z-30 md:translate-x-0 md:shadow-none
          ${
            mobileOpen
              ? "w-[min(18rem,85vw)] translate-x-0"
              : "w-[min(18rem,85vw)] -translate-x-full"
          }
          ${open ? "md:w-64" : "md:w-[84px]"}
        `}
      >
        {/* Brand */}
        <div
          className={`flex h-[66px] shrink-0 items-center border-b border-white/10 ${
            showLabels ? "justify-between px-5" : "justify-center px-2"
          }`}
        >
          <Link
            href="/sales-dashboard"
            aria-label="Promizone Sales Dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F27B1E] text-white shadow-lg shadow-orange-950/20">
              <Building2 size={23} strokeWidth={2.3} />
            </span>

            {showLabels && (
              <span className="min-w-0">
                <span className="block truncate text-[17px] font-bold tracking-tight">
                  Promizone
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">
                  Sales workspace
                </span>
              </span>
            )}
          </Link>

          {mobileOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl p-2 text-blue-100 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation heading */}
        <div className="px-4 pb-2 pt-7">
          {showLabels ? (
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/60">
              Workspace
            </p>
          ) : (
            <div className="mx-auto h-px w-8 bg-white/15" />
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                title={!showLabels ? link.label : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`
                  group relative flex min-h-[48px]
                  items-center gap-3 overflow-hidden rounded-xl
                  px-3.5 text-sm font-medium
                  transition-all duration-200
                  ${
                    active
                      ? "bg-white text-[#0A2E66] shadow-md shadow-blue-950/10"
                      : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                  }
                  ${!showLabels ? "justify-center px-0" : ""}
                `}
              >
                {/* Orange active indicator */}
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#F27B1E]" />
                )}

                {/* Icon background and color */}
                <span
                  className={`
                    flex h-9 w-9 shrink-0 items-center
                    justify-center rounded-xl transition-colors
                    ${
                      active
                        ? "bg-orange-50 text-[#F27B1E]"
                        : "text-blue-100/80 group-hover:bg-white/10 group-hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                </span>

                {showLabels && (
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                )}

                {showLabels && active && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F27B1E]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {showLabels && (
            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-300">
                  <Building2 size={16} />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    Sales Workspace
                  </p>
                  <p className="mt-0.5 text-[10px] text-blue-200/70">
                    Manage your clients
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={!showLabels ? "Logout" : undefined}
            className={`
              group flex min-h-[46px] w-full items-center
              gap-3 rounded-xl px-3.5 text-sm font-medium
              text-red-200 transition-colors
              hover:bg-red-400/10 hover:text-red-100
              disabled:cursor-not-allowed disabled:opacity-60
              ${!showLabels ? "justify-center px-0" : ""}
            `}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              <LogOut size={20} strokeWidth={1.9} />
            </span>

            {showLabels && (
              <span>{loggingOut ? "Logging out..." : "Sign out"}</span>
            )}
          </button>

          {/* Desktop collapse control */}
          <Button
            type="button"
            variant="ghost"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setOpen((previous) => !previous)}
            className="mt-2 hidden min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent text-xs text-blue-100/70 hover:bg-white/10 hover:text-white md:flex"
          >
            {open ? (
              <>
                <ChevronLeft size={17} />
                <span>Collapse sidebar</span>
              </>
            ) : (
              <ChevronRight size={19} />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default SalesSidebar;
