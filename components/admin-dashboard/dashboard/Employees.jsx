"use client";

import { teamMemberService } from "@/service/admin-dashboard/dashboard-api";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmployee() {
    try {
      const res = await teamMemberService();
      if (res?.success) {
        const formattedEmployees = (res?.data || []).map((employee) => ({
          _id: employee?._id,
          name: employee?.basicDetails?.name || "Employee",
          designation: employee?.basicDetails?.designation || "Employee",
          profileImage: employee?.basicDetails?.profileImage || null,
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
          <p className="text-slate-600 text-sm">
            Active employees in the organization
          </p>
        </div>
        <Link
          href={"/dashboard/employee"}
          className="text-blue-600 text-sm font-semibold hover:underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <Skeleton circle height={64} width={64} className="mb-3" />
              <Skeleton height={14} width={80} className="mb-2" />
              <Skeleton height={12} width={70} />
            </div>
          ))}
        </div>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {employees.slice(0, 6).map((employee) => (
            <Link
              href={
                employee.designation === "SALES"
                  ? `/dashboard/employee/employee-details/sales/${employee._id}`
                  : `/dashboard/employee/employee-details/${employee._id}`
              }
              key={employee._id}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative w-16 h-16 mb-3 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-blue-500 group-hover:border-2  transition-colors duration-300">
                {employee.profileImage ? (
                  <Image
                    src={employee.profileImage}
                    alt={employee.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 truncate w-full px-2">
                {employee.name}
              </h3>
              <p className="text-xs text-slate-500 truncate w-full px-2">
                {employee.designation || "Employee"}
              </p>
            </Link>
          ))}
          {employees.length > 6 && (
            <div className="flex flex-col items-center justify-center text-center cursor-pointer group">
              <div className="w-16 h-16 mb-3 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-500 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
                <span className="text-sm font-bold">
                  +{employees.length - 6}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                View More
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          No employees found.
        </div>
      )}
    </div>
  );
};

export default Employees;
