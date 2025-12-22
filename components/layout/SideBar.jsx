"use client";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  FileText,
  BookUser,
  BookText,
  LogOut,
  IdCardLanyard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "@/service/axiosInstance";

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(false);
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
    {
      href: "/dashboard/proposal/all-proposal",
      label: "Propsals",
      icon: <BookText />,
    },
    {
      href: "/dashboard/invoice",
      label: "Invoice",
      icon: <FileText size={100} />,
    },
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
          {open && <h1 className="text-2xl font-bold grow">Promizone</h1>}
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
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default SideBar;
