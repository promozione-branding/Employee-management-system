"use client";

import Loading from "@/components/layout/Loading";
import { getClientHistoryService } from "@/service/customer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ClientHistory = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [clientHistoryData, setClientHistoryData] = useState([]);

  console.log(clientHistoryData, "clientHistoryData");

  useEffect(() => {
    async function getClientHistory() {
      try {
        const res = await getClientHistoryService(customerId);
        if (res.success) {
          setLoading(false);
          setClientHistoryData(res.data);
          toast.success(res.message || "Client history fetched");
        }
      } catch (error) {
        console.log(error);
        setClientHistoryData([]);
        toast.error(
          error.response.data.message ||
            "Error while fetching the client history"
        );
      }
    }
    getClientHistory();
  }, [customerId]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {clientHistoryData?.length > 0 ? (
            clientHistoryData.map((history) => (
              <div
                key={history._id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-2">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                      {history.action}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(history.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {history.changedBy?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {history.changedBy?.email} ({history.changedBy?.role})
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 uppercase mb-2">
                    <div>Field</div>
                    <div>Old Value</div>
                    <div>New Value</div>
                  </div>
                  {history.changes?.map((change) => (
                    <div
                      key={change._id}
                      className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-gray-100"
                    >
                      <div className="font-medium text-gray-700">
                        {change.field}
                      </div>
                      <div className="text-red-500 break-words">
                        {String(change.oldValue)}
                      </div>
                      <div className="text-green-600 break-words">
                        {String(change.newValue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No history found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientHistory;
