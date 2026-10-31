
"use client";

import { teamMemberService } from "@/service/admin-dashboard/dashboard-api";
import { UsersRound, UserRound, ArrowUpRight, Users } from "lucide-react";
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
      console.error("Failed to fetch team members:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  return (
    <section className="h-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0A2E66]">
            <UsersRound size={22} strokeWidth={1.9} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-[#0A2E66] sm:text-xl">
              Team Members
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Active employees in the organization
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/employee"
          className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#0A2E66] transition-colors hover:bg-blue-50"
        >
          View all
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* Employee count */}
      {!loading && employees.length > 0 && (
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#F27B1E]">
            <Users size={15} />
          </span>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">
              {employees.length}
            </span>{" "}
            {employees.length === 1 ? "team member" : "team members"}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col items-center rounded-xl border border-slate-100 p-3"
            >
              <Skeleton circle height={60} width={60} />
              <Skeleton height={13} width={85} className="mt-3" />
              <Skeleton height={11} width={65} className="mt-1" />
            </div>
          ))}
        </div>
      ) : employees.length > 0 ? (
        /* Employee grid */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {employees.map((employee) => {
            const isSales = employee.designation === "SALES";

            const employeeHref = isSales
              ? `/dashboard/employee/employee-details/sales/${employee._id}`
              : `/dashboard/employee/employee-details/${employee._id}`;

            return (
              <Link
                href={employeeHref}
                key={employee._id}
                className="group flex min-w-0 flex-col items-center rounded-2xl border border-slate-100 bg-white px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27B1E] focus-visible:ring-offset-2 sm:px-3"
              >
                {/* Avatar */}
                <div className="relative mb-3 h-[60px] w-[60px] shrink-0 rounded-full bg-slate-50 p-[3px] ring-1 ring-slate-200 transition-all duration-200 group-hover:ring-2 group-hover:ring-[#F27B1E] sm:h-16 sm:w-16">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-blue-50">
                    {employee.profileImage ? (
                      <Image
                        src={employee.profileImage}
                        alt={employee.name}
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#0A2E66]">
                        <UserRound size={25} strokeWidth={1.7} />
                      </div>
                    )}
                  </div>

                  {/* Small brand accent */}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#F27B1E]" />
                </div>

                {/* Name */}
                <h3 className="w-full truncate px-1 text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#0A2E66]">
                  {employee.name}
                </h3>

                {/* Designation */}
                <span className="mt-1.5 max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">
                  {employee.designation || "Employee"}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0A2E66]">
            <UsersRound size={23} />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            No team members found
          </h3>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
            Employee profiles will appear here once team members are available.
          </p>

          <Link
            href="/dashboard/employee"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0A2E66] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#082451]"
          >
            View employees
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
};

export default Employees;
