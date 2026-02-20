"use client";

import { getUpdateService } from "@/service/admin-dashboard/employee/sales-work";
import React, { useEffect, useState } from "react";
import Shemar from "@/components/layout/Skeleton";

const SalesUpdateTab = ({ employeeId }) => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchMeetingUpdates() {
    try {
      const res = await getUpdateService(employeeId);
      if (res.success) {
        setUpdates(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      fetchMeetingUpdates();
    }
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="mt-5">
        <Shemar count={3} />
      </div>
    );
  }

  return (
    <div className="mt-5">
      {updates && updates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {updates.map((item) => (
            <div
              key={item._id}
              className="p-4 border rounded-lg shadow-sm bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {item.updateType}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      item.status === "not-interested"
                        ? "bg-red-100 text-red-800"
                        : item.status === "talk"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.status.replace("-", " ")}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-700">
                    Client: {item.client.name}
                  </p>
                  <p className="text-gray-600">
                    Company: {item.client.company}
                  </p>
                  {item.note && (
                    <p className="text-gray-700 bg-gray-50 p-2 rounded mt-2">
                      <span className="font-medium">Note:</span> {item.note}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {item.reminderAt && (
                  <p className="text-xs text-gray-500 mt-3">
                    Reminder: {new Date(item.reminderAt).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-400 pt-3 mt-3 border-t">
                  Created: {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No updates found.</p>
      )}
    </div>
  );
};

export default SalesUpdateTab;
