"use client";

import React, { useState } from "react";
import { Bell, Search, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/service/axiosInstance";
import Loading from "../Loading";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const SalesNavbar = () => {
  const router = useRouter();
  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);

  const { employee, loading, clearEmployee } = useSalesEmployeeStore();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");

      clearEmployee(); // 🔥 clear Zustand state
      sessionStorage.removeItem("employeeData");

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  if (loading) return <Loading />;
  if (!employee) return null;

  const basic = employee.basicDetails || {};

  return (
    <div className="bg-white h-16 px-6 flex items-center justify-between border-b shadow-sm relative">
      {/* Left */}
      <h2 className="text-xl font-semibold text-gray-800">
        Sales Dashboard
      </h2>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-9 h-9 w-64 rounded-md border bg-gray-50 px-3 text-sm"
          />
        </div>

        {/* Notification */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* Profile */}
        <div
          className="flex items-center gap-2 border-l pl-4 cursor-pointer"
          onClick={() => setOpenEmployeeDetails((p) => !p)}
        >
          <Image
            width={32}
            height={32}
            alt="employee"
            className="rounded-full"
            src={basic.profileImage || "https://github.com/shadcn.png"}
          />
          <span className="text-sm font-medium hidden sm:block capitalize">
            {basic.name}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {openEmployeeDetails && (
        <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-xl border">
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold capitalize">
              {basic.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {Array.isArray(basic.email)
                ? basic.email[0]
                : basic.email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/employee-dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded"
              onClick={() => setOpenEmployeeDetails(false)}
            >
              <User size={18} />
              My Profile
            </Link>

            <Link
              href="/employee-dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded"
              onClick={() => setOpenEmployeeDetails(false)}
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>

          <div className="p-2 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesNavbar;
