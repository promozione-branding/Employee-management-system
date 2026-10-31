
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  UsersRound,
  UserRoundCog,
  FileBarChart,
  LogOut,
  Search,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Building2,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axiosInstance from "@/service/axiosInstance";
import { useAdminStore } from "@/lib/store/AdminStore";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and performance",
  },
  {
    href: "/dashboard/customer",
    label: "Customers",
    icon: UsersRound,
    description: "Manage customers",
  },
  {
    href: "/dashboard/employee",
    label: "Employees",
    icon: UserRoundCog,
    description: "Manage your team",
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileBarChart,
    description: "Business reports",
  },
];

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { adminDetail } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();

  const username = adminDetail?.username || "Admin";
  const email =
    adminDetail?.email || "admin2@promozionebranding.com";

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Logout failed."
      );
      console.error(error);
    }
  };

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // The mobile drawer always displays labels.
  const showLabels = open || mobileOpen;

  return (
    <div
      className="flex min-h-screen bg-[#F2F4F9] text-slate-800"
      style={{ "--brand-navy": NAVY, "--brand-orange": ORANGE }}
    >
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px]
          transition-opacity duration-300 md:hidden
          ${
            mobileOpen
              ? "visible opacity-100"
              : "invisible opacity-0"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh
          flex-col border-r border-white/10 bg-[#0A2E66] text-white
          shadow-xl transition-[width,transform] duration-300 ease-in-out
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
          className={`flex h-[76px] shrink-0 items-center border-b
            border-white/10 ${
              showLabels
                ? "justify-between px-5"
                : "justify-center px-2"
            }`}
        >
          <Link
            href="/dashboard"
            aria-label="Inquiry Bazaar home"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center
                justify-center rounded-2xl bg-[#F27B1E]
                shadow-lg shadow-orange-950/20"
            >
              <Building2 size={23} strokeWidth={2.3} />
            </div>

            {showLabels && (
              <div className="min-w-0">
                <p className="truncate text-[17px] font-bold tracking-tight">
                  Inquiry Bazaar
                </p>
                <p className="mt-0.5 text-[10px] font-semibold
                  uppercase tracking-[0.18em] text-blue-200/80">
                  Admin workspace
                </p>
              </div>
            )}
          </Link>

          {mobileOpen && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl p-2 text-blue-100
                transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation heading */}
        <div className="px-4 pb-2 pt-7">
          {showLabels ? (
            <p className="px-2 text-[10px] font-bold uppercase
              tracking-[0.18em] text-blue-200/60">
              Workspace
            </p>
          ) : (
            <div className="mx-auto h-px w-8 bg-white/15" />
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={!showLabels ? link.label : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex min-h-[48px]
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
                {/* Active indicator */}
                {active && (
                  <span
                    className="absolute bottom-2 left-0 top-2 w-[3px]
                      rounded-r-full bg-[#F27B1E]"
                  />
                )}

                <span
                  className={`flex h-9 w-9 shrink-0 items-center
                    justify-center rounded-xl transition-colors
                    ${
                      active
                        ? "bg-orange-50 text-[#F27B1E]"
                        : "text-blue-100/80 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                </span>

                {showLabels && (
                  <span className="min-w-0 flex-1 truncate">
                    {link.label}
                  </span>
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
            <div className="mb-3 rounded-xl border border-white/10
              bg-white/[0.06] px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center
                  justify-center rounded-lg bg-white/10 text-orange-300">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    Business Workspace
                  </p>
                  <p className="mt-0.5 text-[10px] text-blue-200/70">
                    Manage your operations
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className={`flex min-h-[46px] w-full items-center
              gap-3 rounded-xl px-3.5 text-sm font-medium
              text-red-200 transition-colors
              hover:bg-red-400/10 hover:text-red-100
              ${!showLabels ? "justify-center px-0" : ""}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center
              justify-center rounded-xl">
              <LogOut size={20} strokeWidth={1.9} />
            </span>
            {showLabels && <span>Sign out</span>}
          </button>

          {/* Desktop collapse control */}
          <button
            type="button"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setOpen((previous) => !previous)}
            className="mt-2 hidden min-h-[42px] w-full items-center
              justify-center gap-2 rounded-xl border border-white/10
              text-xs text-blue-100/70 transition
              hover:bg-white/10 hover:text-white md:flex"
          >
            {open ? (
              <>
                <PanelLeftClose size={17} />
                <span>Collapse sidebar</span>
              </>
            ) : (
              <ChevronRight size={19} />
            )}
          </button>
        </div>
      </aside>

      {/* Main application area */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[68px]
          shrink-0 items-center justify-between border-b
          border-slate-200/80 bg-white/95 px-3 shadow-sm
          backdrop-blur-xl sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile menu */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="h-10 w-10 shrink-0 rounded-xl text-[#0A2E66]
                hover:bg-blue-50 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </Button>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-800">
                {navLinks.find((link) => isActive(link.href))?.label ||
                  "Workspace"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Welcome to your dashboard
              </p>
            </div>

            {/* Mobile brand/title */}
            <div className="min-w-0 sm:hidden">
              <p className="truncate text-sm font-bold text-[#0A2E66]">
                Inquiry Bazaar
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Admin workspace
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Search placeholder for future integration */}
            <button
              type="button"
              aria-label="Search (coming soon)"
              title="Search"
              className="hidden h-10 w-10 items-center justify-center
                rounded-xl text-slate-500 transition
                hover:bg-slate-100 hover:text-[#0A2E66] sm:flex"
            >
              <Search size={19} />
            </button>

            {/* Notification placeholder for future integration */}
            <button
              type="button"
              aria-label="Notifications (coming soon)"
              title="Notifications"
              className="relative hidden h-10 w-10 items-center
                justify-center rounded-xl text-slate-500 transition
                hover:bg-slate-100 hover:text-[#0A2E66] sm:flex"
            >
              <Bell size={19} />
            </button>

            <div className="mx-0.5 hidden h-8 w-px bg-slate-200 sm:block" />

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-label="Toggle user menu"
                onClick={() => setUserMenuOpen((previous) => !previous)}
                className={`flex items-center gap-2 rounded-xl p-1.5
                  transition hover:bg-slate-50 sm:gap-3 sm:pl-2 ${
                    userMenuOpen ? "bg-slate-50" : ""
                  }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center
                  justify-center rounded-xl bg-blue-50 text-[#0A2E66]
                  ring-1 ring-blue-100">
                  <UserCircle size={23} strokeWidth={1.8} />
                </div>

                <div className="hidden max-w-36 text-left sm:block">
                  <p className="truncate text-sm font-semibold capitalize
                    text-slate-800">
                    {username}
                  </p>
                  <p className="text-[11px] text-slate-500">Administrator</p>
                </div>

                <ChevronDown
                  size={15}
                  className={`hidden text-slate-400 transition-transform sm:block
                    ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close user menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-[calc(100%+12px)]
                    z-50 w-[min(18rem,calc(100vw-1.5rem))]
                    overflow-hidden rounded-2xl border border-slate-200
                    bg-white shadow-xl shadow-slate-900/10">
                    <div className="bg-[#F2F4F9] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0
                          items-center justify-center rounded-xl
                          bg-white text-[#0A2E66] shadow-sm">
                          <UserCircle size={25} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold
                            capitalize text-slate-800">
                            {username}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl
                          px-3 py-2.5 text-sm text-slate-700
                          transition hover:bg-blue-50 hover:text-[#0A2E66]"
                      >
                        <UserCircle size={18} />
                        <span>My Profile</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3
                          rounded-xl px-3 py-2.5 text-sm font-medium
                          text-red-600 transition hover:bg-red-50"
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

        {/* Page content */}
        <main className="min-w-0 flex-1 bg-[#F2F4F9] p-3
          sm:p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
