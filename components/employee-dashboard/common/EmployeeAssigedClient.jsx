"use client";

import { assignedClientService } from "@/service/admin-dashboard/employee/work";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { Mail, Link2, User } from "lucide-react";
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

  useEffect(() => {
    if (employeeId) {
      fetchClientList();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 lg:h-[68vh] lg:w-1/2">
        <Skeleton height={28} width={200} className="mb-4" />
        <div className="space-y-4 overflow-hidden h-[50vh]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
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
    <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 lg:h-[68vh] lg:w-1/2">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Assigned Clients
      </h2>
      {clients.length === 0 ? (
        <p className="text-slate-500">No clients assigned.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto h-[50vh]">
          {clients.map((item) => (
            <Link
            href={`/employee-dashboard/clients/client-details/${item.clientId?._id}`}
              key={item._id}
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors block"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-200 p-3 rounded-full">
                  <User className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    {item.clientId?.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {item.clientId?.company}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                    <Mail size={14} />
                    <a
                      href={`mailto:${item.clientId?.email}`}
                      className="hover:underline"
                    >
                      {item.clientId?.email}
                    </a>
                  </div>
                  {item.clientId?.website && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Link2 size={14} />
                      <a
                        href={item.clientId.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
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
