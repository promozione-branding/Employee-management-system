
"use client";

import { useRouter } from "next/navigation";
import { callUpdatesService } from "@/service/sales-dashboard/activity";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "@/components/layout/Skeleton";
import { Calendar, Clock, Phone, Users } from "lucide-react";

const UpdateTab = ({ userId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUpdates = useCallback(async () => {
    setLoading(true);

    try {
      const res = await callUpdatesService(userId);

      if (res?.success) {
        setUpdates(Array.isArray(res.data) ? res.data : []);
      } else {
        setUpdates([]);
        toast.error(res?.message || "Unable to fetch updates");
      }
    } catch (error) {
      setUpdates([]);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error while fetching the updates"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUpdates();
    } else {
      setUpdates([]);
      setLoading(false);
    }
  }, [userId, fetchUpdates]);

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleClientClick = (item) => {
    const clientId = item?.client?._id || item?.clientId;

    if (clientId) {
      router.push(`/sales-dashboard/clients/${clientId}`);
    } else {
      toast.error("Customer ID not found");
    }
  };

  const handleCardKeyDown = (event, item) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClientClick(item);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <Skeleton count={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!updates.length) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        No updates found
      </div>
    );
  }

  return (
    <div className="mt-4 grid h-[calc(100vh-220px)] grid-cols-1 gap-4 overflow-y-auto pb-4 pr-2 md:grid-cols-2 lg:grid-cols-3">
      {updates.map((item) => (
        <div
          key={item._id}
          role="link"
          tabIndex={0}
          aria-label={`View customer ${item.client?.name || "details"}`}
          onClick={() => handleClientClick(item)}
          onKeyDown={(event) => handleCardKeyDown(event, item)}
          className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2.5 ${
                  item.updateType === "meeting"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {item.updateType === "meeting" ? (
                  <Users size={18} />
                ) : (
                  <Phone size={18} />
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {item.client?.name || "Unknown Client"}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.client?.company || "No Company"}</span>
                  <span>•</span>
                  <span className="capitalize">
                    {item.updateType || "Update"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  item.status === "talk" ||
                  item.status === "interested"
                    ? "bg-green-100 text-green-700"
                    : item.status === "not-interested" ||
                        item.status === "no-talk"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.status || "No Status"}
              </span>

              <span className="text-[10px] text-gray-400">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>

          <div className="mt-3 pl-[52px]">
            {item.note && (
              <p className="mb-2 rounded-lg bg-gray-50 p-2.5 text-sm text-gray-600">
                {item.note}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-3">
              {item.meetingAt && (
                <div className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-600">
                  <Calendar size={14} />
                  <span>Meeting: {formatDate(item.meetingAt)}</span>
                </div>
              )}

              {item.reminderAt && (
                <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-600">
                  <Clock size={14} />
                  <span>Reminder: {formatDate(item.reminderAt)}</span>

                  <span
                    className={`ml-1 ${
                      item.reminderSent
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {item.reminderSent ? "(Sent)" : "(Pending)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpdateTab;
