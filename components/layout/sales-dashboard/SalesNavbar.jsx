"use client";

import React from "react";
import { Bell, Search, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const SalesNavbar = () => {
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
        <div className="flex items-center gap-2 border-l pl-4 cursor-pointer">
          <Image
            width={32}
            height={32}
            alt="employee"
            className="rounded-full"
            src="https://github.com/shadcn.png"
          />
          <span className="text-sm font-medium hidden sm:block capitalize">
            Profile
          </span>
        </div>
      </div>

      {/* Static Dropdown UI */}
      {/* <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-xl border">
        <div className="p-4 border-b bg-gray-50">
          <p className="font-semibold capitalize">Employee Name</p>
          <p className="text-xs text-gray-500 truncate">
            employee@email.com
          </p>
        </div>

        <div className="p-2">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded"
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>

        <div className="p-2 border-t">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default SalesNavbar;
