"use client";

import { getTeamUpdateAdminService } from "@/service/customer/history";
import { useEffect, useState } from "react";

const TeamUpdate = ({ clientId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      if (!clientId) return;
      try {
        setLoading(true);
        const response = await getTeamUpdateAdminService(clientId);
        if (response?.success) {
          setUpdates(response.data);
        } else {
          setError(response?.message || "Failed to fetch updates.");
        }
      } catch (err) {
        console.error("Error loading team updates:", err);
        setError("An error occurred while loading team updates.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Team Updates</h2>
      <div className="grid grid-cols-3 gap-4">
        {updates.length === 0 ? (
          <p className="text-gray-500">No updates found for this client.</p>
        ) : (
          updates.map((update) => (
            <div
              key={update._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {update.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(update.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full uppercase font-medium tracking-wide ${
                    update.updateType === "urgent"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {update.updateType}
                </span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {update.description}
              </p>

              {update.link && update.link !== "fdg" && (
                <a
                  href={
                    update.link.startsWith("http")
                      ? update.link
                      : `https://${update.link}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium inline-flex items-center gap-1 mb-4"
                >
                  View Attachment
                </a>
              )}

              <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-500">
                <span>
                  Posted by:{" "}
                  <span className="font-medium text-gray-900">
                    {update.createdBy?.username}
                  </span>
                </span>
                <div title={update.recipients?.join(", ")}>
                  {update.recipients?.map((item) => (
                    <span key={item?._id}>{item.split("@")[0]}, </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamUpdate;
