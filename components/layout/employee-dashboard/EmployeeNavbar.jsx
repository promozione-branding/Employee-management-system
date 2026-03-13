"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  Settings,
  User,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getEmployeeDetailsService } from "@/service/employee-dashboard/employee";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/service/axiosInstance";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";
import { getTeamUpdateService } from "@/service/team-update";

const EmployeeNavbar = () => {
  const { employee } = useEmployeeStore();

  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [teamUpdateList, setTeamUpdateList] = useState([]);

  const router = useRouter();

  const employeeEmails = Array.isArray(employee?.basicDetails?.email)
    ? employee.basicDetails.email.filter(Boolean)
    : employee?.basicDetails?.email
      ? [employee.basicDetails.email]
      : [];

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

  async function fetchTeamUpdate() {
    try {
      const res = await getTeamUpdateService();
      if (res.success) {
        const filteredUpdates = (res.data || []).filter((update) => {
          if (!Array.isArray(update?.recipients) || !update.recipients.length) {
            return true;
          }

          return update.recipients.some((recipient) =>
            employeeEmails.includes(recipient),
          );
        });

        setTeamUpdateList(filteredUpdates);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
      console.log(error);
    }
  }

  useEffect(() => {
    if (employeeEmails.length) {
      fetchTeamUpdate();
    }
  }, [employee?.basicDetails?.email]);

  return (
    <div className="bg-white h-16 px-6 flex items-center justify-between border-b shadow-sm relative">
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

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() =>
            setOpenNotification((prev) => {
              setOpenEmployeeDetails(false);
              return !prev;
            })
          }
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <div className="flex items-center gap-2 border-l pl-4 ml-2">
          <div
            className="h-8 w-8  flex items-center justify-center cursor-pointer"
            onClick={() =>
              setOpenEmployeeDetails((prev) => {
                setOpenNotification(false);
                return !prev;
              })
            }
          >
            <Image
              width="1000"
              height="1000"
              alt="employeeImage"
              className=" rounded-full"
              src={
                employee?.basicDetails?.profileImage ||
                "https://github.com/shadcn.png"
              }
            />
          </div>
          <span className="text-sm font-medium hidden sm:block capitalize">
            {employee?.basicDetails?.name}
          </span>
        </div>
      </div>

      {/* opening tab  */}

      {openEmployeeDetails && (
        <div className="absolute top-16 right-6 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <p className="font-semibold text-gray-800 capitalize">
              {employee?.basicDetails?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {Array.isArray(employee?.basicDetails?.email)
                ? employee?.basicDetails?.email[0]
                : employee?.basicDetails?.email || "employee@promozione.com"}
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

      {/* notification  */}

      {openNotification && (
        <div className="absolute top-16 right-16 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Team Updates</h3>
            <Link href={"/employee-dashboard/team-update"} className="bg-blue-100 text-blue-600 text-xs px-2 py-2 rounded-full">
              <Plus />
            </Link>
          </div>

          <div className="overflow-y-auto">
            {teamUpdateList.length > 0 ? (
              teamUpdateList.map((update) => (
                <div
                  key={update._id}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {update.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {update.description}
                  </p>
                  {Array.isArray(update.recipients) &&
                  update.recipients.length > 0 ? (
                    <p className="text-[11px] text-gray-400 mb-2 line-clamp-2">
                      To: {update.recipients.join(", ")}
                    </p>
                  ) : null}
                  {update.link && (
                    <a
                      href={update.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      View Link <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No new updates</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeNavbar;
