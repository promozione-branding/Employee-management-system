"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, UserCircle, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/service/axiosInstance";
import { useEmployee } from "./Layout";
import Loading from "../Loading";

const SalesNavbar = () => {
  const { basicEmployeeData, loading } = useEmployee();
  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/user/logout");
      sessionStorage.removeItem("employeeData");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
      console.log(error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white h-16 px-6 flex items-center justify-between border-b shadow-sm relative">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Sales Dashboard</h2>
      </div>

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
            className="h-8 w-8  flex items-center justify-center cursor-pointer"
            onClick={() => setOpenEmployeeDetails((prev) => !prev)}
          >
            <Image
              width="1000"
              height="1000"
              alt="employeeImage"
              className=" rounded-full"
              src={
                basicEmployeeData?.basicDetails?.profileImage ||
                "https://github.com/shadcn.png"
              }
            />
          </div>
          <span className="text-sm font-medium hidden sm:block capitalize">
            {basicEmployeeData?.basicDetails?.name}
          </span>
        </div>
      </div>

      {/* opening tab  */}

      {openEmployeeDetails && (
        <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <p className="font-semibold text-gray-800 capitalize">
              {basicEmployeeData?.basicDetails?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {Array.isArray(basicEmployeeData?.basicDetails?.email)
                ? basicEmployeeData?.basicDetails?.email[0]
                : basicEmployeeData?.basicDetails?.email ||
                  "employee@promozione.com"}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/employee-dashboard/profile"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpenEmployeeDetails(false)}
            >
              <User size={18} />
              <span>My Profile</span>
            </Link>
            <Link
              href="/employee-dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpenEmployeeDetails(false)}
            >
              <Settings size={18} />
              <span>Settings</span>
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
    </div>
  );
};

export default SalesNavbar;
