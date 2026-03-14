"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Loading from "@/components/layout/Loading";
import { getEmployeeAssignedClientService } from "@/service/employee-dashboard/employee";
import { ChartNetwork, Clock, Eye, SquareChartGantt } from "lucide-react";
import { useEmployeeStore } from "@/lib/store/EmployeeStore";

const ClientListExecutive = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { employee } = useEmployeeStore();



  useEffect(() => {
    async function getEmployeeClientList() {
      try {
        if (employee?._id) {
          const res = await getEmployeeAssignedClientService(
            employee?._id,
          );
          if (res.success) {
            setLoading(false);
            setClients(res.data?.workDetails);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            "Error while getting the client list",
        );
      }
    }
    getEmployeeClientList();
  }, [employee?._id]);

  

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Clients</h1>
        {/* <Button>Add Client</Button> */}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Website
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Updated At
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client?.clientId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client?.clientId?.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={client?.clientId?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {client?.clientId?.website || "----"}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.updatedAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-6">
                    <Link
                      title="View"
                      href={`/employee-dashboard/clients/client-details/${client?.clientId?._id}`}
                      className="border px-3 py-1.5 rounded-lg"
                    >
                     View
                    </Link>
                
                    <Link
                      title="Work"
                      href={`/employee-dashboard/clients/work/${client._id}`}
                      className="border px-3 py-1.5 rounded-lg"
                    >
                      Work
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientListExecutive;
