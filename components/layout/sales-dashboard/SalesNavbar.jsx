"use client";

import React, { useState } from "react";
import { Bell, Search, LogOut, Settings, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/service/axiosInstance";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

const SalesNavbar = () => {
  const router = useRouter();
  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);

  const { employee, clearEmployee } = useSalesEmployeeStore();

  const [lightMode, setLightMode] = useState(true);

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

  return (
    <div className="bg-white h-16 px-6 flex items-center justify-between border-b shadow-sm relative">
      {/* Left */}
      <h2 className="text-xl font-semibold text-gray-800">Sales Dashboard</h2>

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
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-caret-blink" />
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
            src={
              employee?.basicDetails?.profileImage ||
              "https://github.com/shadcn.png"
            }
          />
          <span className="text-sm font-medium hidden sm:block capitalize">
            {employee?.basicDetails?.name || "Profile"}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {openEmployeeDetails && (
        <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-xl border">
          <div className="p-4 border-b bg-gray-50">
            <p className="font-semibold capitalize">
              {employee?.basicDetails?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {Array.isArray(employee?.basicDetails?.email)
                ? employee?.basicDetails?.email[0]
                : employee?.basicDetails?.email || "aalekh@promozione.com"}
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
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded group"
              onClick={() => setOpenEmployeeDetails(false)}
            >
              <Settings size={18} className="group-hover:animate-spin" />
              Settings
            </Link>
            <div
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer transition-colors duration-300"
              onClick={() => setLightMode((prev) => !prev)}
            >
              <div className="relative h-5 w-5 flex items-center justify-center">
                <Sun
                  size={20}
                  className={`absolute transition-all duration-300 ease-in-out ${
                    lightMode
                      ? "opacity-100 transform rotate-0 scale-100"
                      : "opacity-0 transform -rotate-90 scale-50"
                  }`}
                />
                <Moon
                  size={20}
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
