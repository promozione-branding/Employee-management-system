// components/sales-dashboard/activity/UpdateTab.jsx

"use client";

import { useRouter } from "next/navigation";
import { callUpdatesService } from "@/service/sales-dashboard/activity";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "@/components/layout/Skeleton";
import { Calendar, Clock, Phone, Users, ArrowUpRight } from "lucide-react";

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

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

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

    const salesPersonId =
      item?.salesPersonId?._id || item?.salesPersonId || userId;

    if (!clientId) {
      toast.error("Customer ID not found");
      return;
    }

    if (!salesPersonId) {
      toast.error("Salesperson ID not found");
      return;
    }

    router.push(
      `/sales-dashboard/clients/${clientId}/${salesPersonId}?tab=meeting`
    );
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
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
            <Skeleton count={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!updates.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-sm">
        No updates found
      </div>
    );
  }

  return (
    <div className="mt-4 grid h-[calc(100vh-220px)] grid-cols-1 gap-4 overflow-y-auto pb-4 pr-2 md:grid-cols-2 lg:grid-cols-3 [scrollbar-width:thin]">
      {updates.map((item) => {
        const isMeeting = item.updateType === "meeting";
        const isPositiveStatus = ["talk", "interested"].includes(item.status);
        const isNegativeStatus = ["not-interested", "no-talk"].includes(item.status);

        return (
          <div
            key={item._id}
            role="link"
            tabIndex={0}
            aria-label={`View customer ${item?.client?.name || "details"}`}
            onClick={() => handleClientClick(item)}
            onKeyDown={(event) => handleCardKeyDown(event, item)}
            className="group/card relative flex flex-col justify-between cursor-pointer rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-[0_4px_20px_rgba(10,46,102,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0A2E66]/30 dark:hover:border-blue-500/30 hover:shadow-[0_10px_30px_rgba(10,46,102,0.08)] focus:outline-none focus:ring-2 focus:ring-[#0A2E66]"
          >
            <div>
              {/* Header section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover/card:scale-105 ${
                      isMeeting
                        ? "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
                        : "bg-blue-50 text-[#0A2E66] dark:bg-blue-950/50 dark:text-blue-400"
                    }`}
                  >
                    {isMeeting ? <Users size={20} strokeWidth={2} /> : <Phone size={20} strokeWidth={2} />}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white group-hover/card:text-[#0A2E66] dark:group-hover/card:text-blue-400 transition-colors">
                      {item?.client?.name || "Unknown Client"}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="truncate">{item?.client?.company || "No Company"}</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-slate-600 dark:text-slate-300">
                        {item?.updateType || "Update"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/card:bg-[#0A2E66] group-hover:text-white dark:group-hover/card:bg-blue-600 transition-all">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Status & Timestamp */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                    isPositiveStatus
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                      : isNegativeStatus
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item?.status || "No Status"}
                </span>

                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {formatDate(item?.createdAt)}
                </span>
              </div>

              {/* Note section */}
              {item?.note && (
                <div className="mt-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    {item.note}
                  </p>
                </div>
              )}
            </div>

            {/* Footer tags (Meeting & Reminder metadata) */}
            {(item?.meetingAt || item?.reminderAt) && (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                {item?.meetingAt && (
                  <div className="flex items-center gap-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-100/60 dark:border-purple-900/40">
                    <Calendar size={15} className="shrink-0 text-purple-500" />
                    <span className="truncate">Meeting: {formatDate(item.meetingAt)}</span>
                  </div>
                )}

                {item?.reminderAt && (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-100/60 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock size={15} className="shrink-0 text-amber-500" />
                      <span className="truncate">Reminder: {formatDate(item.reminderAt)}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.reminderSent
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-amber-200/60 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                      }`}
                    >
                      {item.reminderSent ? "Sent" : "Pending"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UpdateTab;