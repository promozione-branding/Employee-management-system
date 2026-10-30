
// app/manager/customer/history/my-update/[id]/MyUpdate.jsx

"use client";

import Loading from "@/components/layout/Loading";
import { useManagerEmployeeStore } from "@/lib/store/mangerStore";
import { myClientMeetingHistory } from "@/service/meeting";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const formatDateTime = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function MyUpdate({ customerId }) {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const { employee } = useManagerEmployeeStore();

  const employeeId = employee?.user?._id;

  useEffect(() => {
    let isMounted = true;

    async function handleCustomerHistoryFetch() {
      setLoading(true);

      try {
        const res = await myClientMeetingHistory(
          customerId,
          employeeId
        );

        if (!isMounted) return;

        if (res?.success) {
          const meetings = res.data?.meetingUpdate?.meetingUpdate;

          setHistoryData(
            Array.isArray(meetings) ? meetings : []
          );
        } else {
          setHistoryData([]);
          toast.error(
            res?.message || "Unable to fetch customer meeting history"
          );
        }
      } catch (error) {
        if (!isMounted) return;

        setHistoryData([]);
        toast.error(
          error?.message || "Error while fetching customer history"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (customerId && employeeId) {
      handleCustomerHistoryFetch();
    } else {
      setHistoryData([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [customerId, employeeId]);

  const columns = [
    "S.No",
    "Meeting Type",
    "Notes",
    "Status",
    "Meeting At",
    "Reminder At",
    "Sales Person",
    "Created At",
  ];

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {historyData.length > 0 ? (
                historyData.map((item, idx) => (
                  <tr
                    key={item?._id || idx}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {idx + 1}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium capitalize text-gray-900">
                      {item?.updateType || "Meeting"}
                    </td>

                    <td
                      className="max-w-xs truncate px-6 py-4 text-sm text-gray-500"
                      title={item?.note || ""}
                    >
                      {item?.note || "-"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-500">
                      {item?.status || "Pending"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(item?.meetingAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(item?.reminderAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item?.salesPersonId?.username || "Unknown"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(item?.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
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
}
