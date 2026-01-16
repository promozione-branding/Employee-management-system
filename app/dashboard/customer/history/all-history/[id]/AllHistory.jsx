"use client";

import Loading from "@/components/layout/Loading";
import { getAllHistory } from "@/service/customer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AllHistory = ({ customerId }) => {
  const [allHistoryData, setAllHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAllHistoryFetched() {
      try {
        setLoading(true);
        const res = await getAllHistory(customerId);
        if (res.success) {
          setAllHistoryData(res.data);
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message || "Failed to get all history"
        );
      } finally {
        setLoading(false);
      }
    }
    if (customerId) {
      getAllHistoryFetched();
    }
  }, [customerId]);

  const renderValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 ">
      <h2 className="text-2xl font-semibold mb-4">History Log</h2>
      <div className="space-y-4 h-[90vh] overflow-auto">
        {allHistoryData.length > 0 ? (
          allHistoryData.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                      item.action === "CREATE"
                        ? "bg-green-100 text-green-800"
                        : item.action === "UPDATE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.action}
                  </span>
                  <span className="font-medium text-gray-700">
                    {item.entityType}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Changed By:</span>{" "}
                {item.changedBy?.username} ({item.changedBy?.email})
              </div>

              {item.changes && item.changes.length > 0 && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-semibold mb-2 text-gray-700">Changes:</p>
                  <ul className="space-y-2">
                    {item.changes.map((change) => (
                      <li key={change._id} className="wrap-break-word">
                        {change.field === "ALL" ? (
                          <span className="italic text-gray-500">
                            Entire record {item.action.toLowerCase()}d
                          </span>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium min-w-[100px] capitalize">
                              {change.field}:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-red-50 text-red-700 px-1 rounded line-through decoration-red-500/50">
                                {renderValue(change.oldValue)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="bg-green-50 text-green-700 px-1 rounded">
                                {renderValue(change.newValue)}
                              </span>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No history found for this customer.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllHistory;
