"use client";

import { assignedClientService } from "@/service/admin-dashboard/employee/work";
import Link from "next/link";
import { useEffect, useState } from "react";

const Client = ({ employeeId }) => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);

  const fetchAssignedClient = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const res = await assignedClientService(employeeId);
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedClient();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return <div className="text-gray-500">No assigned clients found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((item) => {
        const client = item.clientId;
        if (!client) return null;

        return (
          <Link
            href={`/dashboard/customer/${client._id}`}
            key={item._id}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {client.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="font-medium">Company:</span> {client.company}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Email:</span> {client.email}
              </p>
              {client.website && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Website:</span>
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {client.website}
                  </a>
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Client;
