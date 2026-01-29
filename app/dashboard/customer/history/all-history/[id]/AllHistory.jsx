"use client";

import Loading from "@/components/layout/Loading";
import { getAllHistory } from "@/service/customer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Pagination from "./Pagination";

const AllHistory = ({ customerId }) => {
  const [allHistoryData, setAllHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  async function getAllHistoryFetched(page = 1) {
    try {
      setLoading(true);
      const res = await getAllHistory(customerId, page);
      if (res.success) {
        setAllHistoryData(res.data);
        // Extract totalPages from pagination object in API response
        setPagination({
          currentPage: page,
          totalPages: res.pagination?.totalPages || 1,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to get all history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (customerId) {
      // Fetch the first page when the component mounts or customerId changes.
      getAllHistoryFetched(1);
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
    <div className="flex flex-col h-[92vh]">
      <h2 className="text-2xl font-semibold mb-4">History Log</h2>
      <div className="flex-1 space-y-4 h-[55vh] overflow-y-scroll">
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
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-700 capitalize">
                              Entire record {item.action.toLowerCase()}d
                            </p>
                            {change.newValue &&
                            typeof change.newValue === "object" ? (
                              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm space-y-1">
                                {Object.entries(change.newValue).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2"
                                    >
                                      <span className="font-medium text-green-700 min-w-[120px] capitalize">
                                        {key}:
                                      </span>
                                      <span className="text-green-800 break-words">
                                        {renderValue(value)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                {renderValue(change.newValue)}
                              </span>
                            )}
                          </div>
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
      <div className="shrink-0 py-2 border-t">
      
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={getAllHistoryFetched}
        />
      </div>
    </div>
  );
};

export default AllHistory;
