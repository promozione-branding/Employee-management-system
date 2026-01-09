"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// This is a mock service. In a real application, you would have a service
// that fetches all customers from your API.
const getAllCustomersService = async () => {
  // Mock data representing what your API might return.
  return Promise.resolve({
    success: true,
    data: [
      {
        _id: "1",
        name: "John Doe",
        company: "Doe Inc.",
        website: "https://doe.com",
        updatedAt: new Date().toISOString(),
        process: 10,
      },
      {
        _id: "2",
        name: "Jane Smith",
        company: "Smith & Co.",
        website: "https://smith.co",
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        process: 10, // 2 days ago
      },
      {
        _id: "3",
        name: "Peter Jones",
        company: "Jones LLC",
        website: "https://jones.com",
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        process: 10, // 5 days ago
      },
    ],
  });
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Replace this with your actual API call
        const response = await getAllCustomersService();
        if (response.success) {
          setClients(response.data);
        } else {
          toast.error("Failed to fetch clients.");
        }
      } catch (error) {
        toast.error(
          error.message || "An error occurred while fetching clients."
        );
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleView = (id) => {
    // Placeholder for view logic, e.g., navigating to a client's detail page
    toast.success(`Viewing client ${id}`);
  };

  const handleDelete = (id) => {
    // Placeholder for delete logic
    // You would typically call a delete service and then refresh the list
    toast.success(`Deleting client ${id}`);
    setClients(clients.filter((client) => client._id !== id));
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading clients...</div>;
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
                Last Active
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Progress
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {client.website}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-10  py-4 whitespace-nowrap text-sm text-gray-500">
                    {client?.process}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/employee-dashboard/clients/${client._id}`}>
                      Work Update
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

export default ClientsPage;
