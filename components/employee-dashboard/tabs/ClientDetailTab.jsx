"use client";

import React, { useEffect, useState } from "react";
import Loading from "@/components/layout/Loading";
import {
  Building2,
  Calendar,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { clientDetailService } from "@/service/employee-dashboard/client";

const ClientDetailTab = ({ clientId }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await clientDetailService(clientId);
        if (res.success) {
          setClient(res.data);
        } else {
          toast.error(res.message || "Failed to fetch client details");
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
        toast.error("Something went wrong while fetching details");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  if (loading) return <Loading />;

  if (!client) {
    return (
      <div className="p-4 text-center text-gray-500">
        No details found for this client.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            {client.name}
          </h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" /> {client.company}
          </p>
        </div>
        <div className="text-sm text-gray-500 text-right">
          <p>Created: {new Date(client.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Contact Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> {client.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> {client.phone}
            </p>
            <p className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />{" "}
              {client.website || "N/A"}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>
                {client.Address}, {client.city}, {client.state} -{" "}
                {client.pincode}, {client.country}
              </span>
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mt-6">
            Official Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> GSTIN:{" "}
              {client.GSTIN || "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" /> Project Cycle
          </h3>
          {client.projectCycle?.projectDuration?.length > 0 ? (
            <div className="space-y-3">
              {client.projectCycle.projectDuration.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-3 rounded border border-gray-200 shadow-sm flex justify-between items-center"
                >
                  <span className="font-medium capitalize text-gray-700">
                    {item.service}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Start: {new Date(item.startDate).toLocaleDateString()}
                  </span>
                  {item?.endDate && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      End: {new Date(item.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No active project cycles found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailTab;
