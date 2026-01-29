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
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/service/axiosInstance";

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      icon: <LayoutDashboard size={100} />,
    },
    {
      href: "/dashboard/customer",
      label: "Customer",
      icon: <BookUser size={100} />,
    },
    // {
    //   href: "/dashboard/proposal/all-proposal",
    //   label: "Propsals",
    //   icon: <BookText />,
    // },
    // {
    //   href: "/dashboard/invoice",
    //   label: "Invoice",
    //   icon: <FileText size={100} />,
    // },
    {
      href: "/dashboard/employee",
      label: "Employee",
      icon: <IdCardLanyard size={100} />,
    },
  ];

  return (
    <div className="flex min-h-screen ">
      <div
        className={`bg-white border-r text-black p-4 flex flex-col transition-all h-screen duration-300 ease-in-out relative ${
          open ? "w-60" : "w-20"
        }`}
      >
        <div className="flex items-center justify-center mb-6">
          {open && <h1 className="text-2xl font-bold grow">Promozione</h1>}
          <Button
            // variant="ghost"
            onClick={() => setOpen(!open)}
            className="hover:bg-black/60"
          >
            <Menu size={30} />
          </Button>
        </div>
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="justify-start gap-4 hover:bg-zinc-700 p-6 hover:text-white"
            >
              <Link href={link.href} className="flex items-center">
                {link.icon}
                {open && <span className="ml-4">{link.label}</span>}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="justify-start gap-4 hover:bg-zinc-700 p-6 hover:text-white w-full"
            onClick={handleLogout}
          >
            <LogOut />
            {open && <span className="ml-4">Logout</span>}
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 px-6 flex items-center justify-end border-b shadow-sm relative">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-9 h-9 w-64 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <div
                className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                <UserCircle size={24} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Aalekh
              </span>
            </div>
          </div>

          {userMenuOpen && (
            <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <p className="font-semibold text-gray-800 capitalize">Aalekh</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  aalekh@promozione.com
                </p>
              </div>

              <div className="p-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <UserCircle size={18} />
                  <span>My Profile</span>
                </Link>
              </div>

              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default SideBar;
