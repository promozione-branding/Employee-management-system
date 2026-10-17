// app/sales-dashboard/clients/history/sales-history/[id]/MeetingHistory.jsx

"use client";

import Loading from "@/components/layout/Loading";
import { clientMeetingHistory } from "@/service/meeting";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CallHistoryList from "@/components/sales-dashboard/client/CallHistoryList";
import { CalendarDays, X } from "lucide-react";

const TABS = [
  { id: "updates", label: "Updates" },
  { id: "calls", label: "Calls" },
];

// ------------------------------------------------------------------
// Sort helper: upcoming meetings first (soonest first), then past
// (most recent first). Meetings without a date go to the bottom.
// ------------------------------------------------------------------
function sortByUpcoming(items) {
  const now = Date.now();
  const withTime = (item) => {
    const t = item?.meetingAt ? new Date(item.meetingAt).getTime() : 0;
    return isNaN(t) ? 0 : t;
  };

  const upcoming = [];
  const past = [];
  const noDate = [];

  for (const item of items) {
    const t = withTime(item);
    if (!t) noDate.push(item);
    else if (t >= now) upcoming.push(item);
    else past.push(item);
  }

  upcoming.sort((a, b) => withTime(a) - withTime(b)); // soonest first
  past.sort((a, b) => withTime(b) - withTime(a)); // most recent first

  return [...upcoming, ...past, ...noDate];
}

// ------------------------------------------------------------------
// Filter: keep meetings whose meetingAt falls on the chosen YYYY-MM-DD
// ------------------------------------------------------------------
function filterByDate(items, dateStr) {
  if (!dateStr) return items;
  const [y, m, d] = dateStr.split("-").map(Number);
  return items.filter((item) => {
    if (!item?.meetingAt) return false;
    const dt = new Date(item.meetingAt);
    return (
      dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
    );
  });
}

const MeetingHistory = ({ customerId }) => {
  const [activeTab, setActiveTab] = useState("updates");
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filterDate, setFilterDate] = useState(""); // "" = all

  useEffect(() => {
    async function handleCustomerHistoryFetch() {
      try {
        const res = await clientMeetingHistory(customerId);
        if (res.success) {
          setHistoryData(res.data?.meetingUpdate?.meetingUpdate || []);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast.error(error.message || "Error while fetching customer history");
      }
    }
    if (customerId) handleCustomerHistoryFetch();
  }, [customerId]);

  // Sorted + filtered list
  const displayed = useMemo(() => {
    const sorted = sortByUpcoming(historyData || []);
    return filterByDate(sorted, filterDate);
  }, [historyData, filterDate]);

  // Counts for quick context
  const counts = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let past = 0;
    (historyData || []).forEach((item) => {
      if (!item?.meetingAt) return;
      const t = new Date(item.meetingAt).getTime();
      if (!isNaN(t)) {
        if (t >= now) upcoming++;
        else past++;
      }
    });
    return { upcoming, past, total: historyData?.length || 0 };
  }, [historyData]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === t.id
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Updates tab */}
      {activeTab === "updates" && (
        <>
          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Toolbar: counts + date picker */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="px-2 py-1 rounded bg-gray-100">
                    Total <b className="text-gray-800">{counts.total}</b>
                  </span>
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
                    Upcoming <b>{counts.upcoming}</b>
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                    Past <b>{counts.past}</b>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CalendarDays className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="border border-gray-200 rounded-md pl-8 pr-2 py-1.5 text-sm bg-white"
                    />
                  </div>
                  {filterDate && (
                    <button
                      type="button"
                      onClick={() => setFilterDate("")}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {displayed.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-10 text-center text-sm text-gray-500">
                  {filterDate
                    ? `No meetings on ${new Date(
                        filterDate,
                      ).toLocaleDateString()}.`
                    : "No history available."}
                </div>
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
                          Reminder At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Person
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayed.map((item, idx) => {
                        const isUpcoming =
                          item?.meetingAt &&
                          new Date(item.meetingAt).getTime() >= Date.now();

                        return (
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={
                                  isUpcoming
                                    ? "text-blue-700 font-medium"
                                    : "text-gray-500"
                                }
                              >
                                {item?.meetingAt
                                  ? new Date(item.meetingAt).toLocaleString(
                                      [],
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "N/A"}
                              </span>
                              {isUpcoming && (
                                <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-700 font-medium uppercase">
                                  upcoming
                                </span>
                              )}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Calls tab */}
      {activeTab === "calls" && (
        <CallHistoryList customerId={customerId} scope="all" />
      )}
    </div>
  );
};

export default MeetingHistory;
