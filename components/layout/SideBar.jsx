"use client";

import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  BookUser,
  LogOut,
  IdCardLanyard,
  Search,
  Bell,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/service/axiosInstance";
import { useAdminStore } from "@/lib/store/AdminStore";

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile sidebar
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { adminDetail } = useAdminStore();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
      console.log(error);
    }
  };


  



  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      href: "/dashboard/customer",
      label: "Customer",
      icon: <BookUser size={22} />,
    },
    {
      href: "/dashboard/employee",
      label: "Employee",
      icon: <IdCardLanyard size={22} />,
    },
  ];



  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 bg-white border-r text-black p-4 flex flex-col transition-all duration-300 ease-in-out h-screen
        ${open ? "w-60" : "w-20"}
        ${mobileOpen ? "left-0" : "-left-full"} md:left-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {open && <h1 className="text-xl font-bold">Promozione</h1>}

          <Button
            variant="ghost"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(!mobileOpen);
              } else {
                setOpen(!open);
              }
            }}
          >
            <Menu size={22} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="justify-start gap-4 hover:bg-zinc-700 hover:text-white p-5"
            >
              <Link
                href={link.href}
                className="flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {open && <span className="ml-3">{link.label}</span>}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="justify-start gap-4 hover:bg-zinc-700 hover:text-white p-5 w-full"
            onClick={handleLogout}
          >
            <LogOut size={22} />
            {open && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 px-4 md:px-6 flex items-center justify-between border-b shadow-sm relative">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Search */}
            {/* <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-9 h-9 w-64 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
              />
            </div> */}

            {/* Notification */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button> */}

            {/* User */}
            <div className="flex items-center gap-2  pl-4 ml-2">
              <div
                className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                <UserCircle size={24} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium hidden sm:block capitalize">
                {adminDetail?.username || "Admin_username"}
              </span>
            </div>
          </div>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <p className="font-semibold text-gray-800 capitalize">
                  {adminDetail?.username || "Admin_username"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {adminDetail?.email || "admin2@promozionebranding.com"}
                </p>
              </div>

              <div className="p-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <UserCircle size={18} />
                  <span>My Profile</span>
                </Link>
              </div>

              <div className="p-2 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-2 md:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
