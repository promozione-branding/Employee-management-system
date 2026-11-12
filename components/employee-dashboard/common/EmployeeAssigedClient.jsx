// components/employee-dashboard/common/EmployeeAssigedClient.jsx

"use client";

import { assignedClientService } from "@/service/admin-dashboard/employee/work";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { Mail, Link2, User, UsersRound } from "lucide-react";
import Link from "next/link";

const EmployeeAssigedClient = ({ employeeId }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchClientList() {
    try {
      if (employeeId) {
        setLoading(true);
        const res = await assignedClientService(employeeId);
        if (res.success) {
          setClients(res.data || []);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error while fetching the client",
      );
    } finally {
      setLoading(false);
    }
  }

  const clientFilter = clients?.filter((client) => client?.clientId !== null);

  useEffect(() => {
    if (employeeId) {
      fetchClientList();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] sm:p-5">
        <Skeleton height={28} width={200} className="mb-4" />
        <div className="space-y-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E9EDF4] p-4">
              <div className="flex items-start gap-4">
                <Skeleton circle height={40} width={40} />
                <div className="flex-1">
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={14} width="50%" className="mt-1" />
                  <Skeleton height={14} width="80%" className="mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <UsersRound size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">Assigned Clients</h2>
            <p className="mt-0.5 text-xs text-[#8A92A6]">Clients assigned to you</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {clientFilter.length}
        </span>
      </div>
      {clientFilter.length === 0 ? (
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-semibold text-[#26344D]">No clients assigned.</p>
        </div>
      ) : (
        <div className="max-h-[524px] min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:px-5">
          {clientFilter.map((item) => (
            <Link
              href={`/employee-dashboard/clients/client-details/${item.clientId?._id}`}
              key={item._id}
              className="block min-w-0 rounded-xl border border-[#E9EDF4] bg-white p-3.5 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-[#FAFBFD] sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
                  <User size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold text-[#26344D]">
                    {item.clientId?.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-[#929BAD]">
                    {item.clientId?.company}
                  </p>
                  <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-[#526078]">
                    <Mail size={14} className="shrink-0 text-[#F27B1E]" />
                    <a
                      href={`mailto:${item.clientId?.email}`}
                      className="truncate hover:text-[#0A2E66] hover:underline"
                    >
                      {item.clientId?.email}
                    </a>
                  </div>
                  {item.clientId?.website && (
                    <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-[#526078]">
                      <Link2 size={14} className="shrink-0 text-[#0A2E66]" />
                      <a
                        href={item.clientId.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-[#0A2E66] hover:underline"
                      >
                        {item.clientId.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeAssigedClient;
