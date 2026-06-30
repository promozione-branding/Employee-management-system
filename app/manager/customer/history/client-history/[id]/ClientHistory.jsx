"use client";

import Loading from "@/components/layout/Loading";
import { getClientHistoryService } from "@/service/customer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const renderValue = (value) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const actionBadgeClass = (action) => {
  if (action === "CREATE") return "bg-green-100 text-green-800";
  if (action === "UPDATE") return "bg-blue-100 text-blue-800";
  if (action === "DELETE") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
};

const HIDDEN_ALL_FIELDS = new Set([
  "meetingDate",
  "salesPersonEmail",
  "SalesPersonName",
  "salesExecutive",
  "notes",
  "invoices",
  "proposals",
  "history",
  "workDetails",
]);

const ClientHistory = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [clientHistoryData, setClientHistoryData] = useState([]);

  useEffect(() => {
    async function getClientHistory() {
      try {
        const res = await getClientHistoryService(customerId);
        if (res.success) {
          setClientHistoryData(res.data);
          toast.success(res.message || "Client history fetched");
        }
      } catch (error) {
        console.log(error);
        setClientHistoryData([]);
        toast.error(
          error.response?.data?.message ||
            "Error while fetching the client history",
        );
      } finally {
        setLoading(false);
      }
    }
    getClientHistory();
  }, [customerId]);

  if (loading) return <Loading />;

  return (
    <div className="w-full space-y-4">
      {clientHistoryData?.length > 0 ? (
        clientHistoryData.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${actionBadgeClass(item.action)}`}
                >
                  {item.action}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {item.entityType || "N/A"}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Changed By:</span>{" "}
              {item.changedBy?.username || "Unknown"} (
              {item.changedBy?.email || "N/A"})
            </div>

            <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
              <p className="font-semibold text-sm text-gray-700 mb-2">Changes</p>
              <ul className="space-y-3">
                {item.changes?.map((change) => (
                  <li key={change._id}>
                    {change.field === "ALL" ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Entire record {item.action.toLowerCase()}d
                        </p>
                        {change.newValue && typeof change.newValue === "object" ? (
                          <div className="bg-green-50 border border-green-200 rounded p-2 space-y-1">
                            {Object.entries(change.newValue)
                              .filter(([key]) => !HIDDEN_ALL_FIELDS.has(key))
                              .map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-sm"
                                >
                                  <span className="font-medium text-green-700 min-w-[130px] capitalize">
                                    {key}:
                                  </span>
                                  <span className="text-green-800 break-all">
                                    {renderValue(value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {renderValue(change.newValue)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                        <span className="font-medium min-w-[110px] capitalize">
                          {change.field}:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                            {renderValue(change.oldValue)}
                          </span>
                          <span className="text-gray-400">{"->"}</span>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            {renderValue(change.newValue)}
                          </span>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          No history found for this customer.
        </div>
      )}
    </div>
  );
};

export default ClientHistory;
