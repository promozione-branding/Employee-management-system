"use client";

import Loading from "@/components/layout/Loading";
import { clientMeetingHistory } from "@/service/meeting";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MeetingHistory = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);

  console.log(historyData, "historyData");

  useEffect(() => {
    async function handleCustomerHistoryFetch() {
      try {
        const res = await clientMeetingHistory(customerId);
        if (res.success) {
          setHistoryData(res.data?.meetingUpdate?.meetingUpdate);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast.error(error.message || "Error while fetching customer history");
      }
    }
    handleCustomerHistoryFetch();
  }, [customerId]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ReminderAt At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Person
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData?.length > 0 ? (
                historyData.map((item, idx) => (
                  <tr key={item?._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {item?.updateType || "Meeting"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                      title={item?.note}
                    >
                      {item?.note || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item?.status || "Pending"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item?.meetingAt
                        ? new Date(item.meetingAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item?.reminderAt
                        ? new Date(item.reminderAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item?.salesPersonId?.username || "Unknown"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MeetingHistory;
