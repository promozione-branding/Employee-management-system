"use client";

import { callUpdatesService } from "@/service/sales-dashboard/activity";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "@/components/layout/Skeleton";
import { Calendar, Clock, Phone, Users } from "lucide-react";

const UpdateTab = ({ userId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUpdates() {
    try {
      const res = await callUpdatesService(userId);
      if (res.success) {
        setLoading(false);
        setUpdates(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "error while fetching the updates",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUpdates();
    }
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg bg-white shadow-sm">
            <Skeleton count={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!updates.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        No updates found
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4 mt-4 h-[calc(100vh-220px)] overflow-y-auto pb-4 pr-2">
      {updates.map((item) => (
        <div
          key={item._id}
          className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-full ${
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
                <h3 className="font-semibold text-gray-800 text-sm">
                  {item.client?.name || "Unknown Client"}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.client?.company || "No Company"}</span>
                  <span>•</span>
                  <span className="capitalize">{item.updateType}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                  item.status === "talk" || item.status === "interested"
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
              <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg mb-2">
                {item.note}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-2">
              {item.meetingAt && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-md">
                  <Calendar size={14} />
                  <span>Meeting: {formatDate(item.meetingAt)}</span>
                </div>
              )}
              {item.reminderAt && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md">
                  <Clock size={14} />
                  <span>Reminder: {formatDate(item.reminderAt)}</span>
                  <span
                    className={`ml-1 ${item.reminderSent ? "text-green-600" : "text-gray-500"}`}
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
