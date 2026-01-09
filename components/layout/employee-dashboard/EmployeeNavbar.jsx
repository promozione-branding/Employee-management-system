"use client";

import React from "react";
import { Bell, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmployeeNavbar = () => {
  return (
    <div className="bg-white h-16 px-6 flex items-center justify-between border-b shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Employee Dashboard
        </h2>
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
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <UserCircle size={24} className="text-gray-500" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Employee</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeNavbar;
