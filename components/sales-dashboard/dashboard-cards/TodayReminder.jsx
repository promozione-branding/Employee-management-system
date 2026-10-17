// components/sales-dashboard/dashboard-cards/TodayReminder.jsx
"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { todayReminderService } from "@/service/sales-dashboard/dashboard-api";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CalendarDays, X } from "lucide-react";

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "custom", label: "Custom" },
];

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "call", label: "Call" },
  { id: "meeting", label: "Meeting" },
  { id: "general", label: "General" },
];

const TodaySalesReminder = () => {
  const { employee } = useSalesEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);

  // Filters
  const [type, setType] = useState("all");
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReminders = useCallback(async () => {
    if (!employee?.user?._id) return;
    setLoading(true);
    try {
      const params = { preset, type };
      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }
      const res = await todayReminderService(employee?.user?._id, params);
      if (res.success) {
        setReminders(res?.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error fetching reminders",
      );
    } finally {
      setLoading(false);
    }
  }, [employee, preset, type, from, to]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  if (loading && reminders.length === 0) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 lg:w-1/2 mb-4 lg:h-[68vh]">
        <Skeleton height={28} width={180} className="mb-4" />
        <div className="space-y-3">
          <Skeleton height={80} count={3} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3eaea] p-4 rounded-lg shadow-sm border border-gray-200 w-full lg:w-1/2 mb-4 lg:h-[68vh] flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-3 shrink-0">
        Reminders
      </h2>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-2 shrink-0">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition ${
              type === t.id
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date filter presets */}
      <div className="flex flex-wrap gap-1.5 mb-2 shrink-0">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
              preset === p.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers */}
      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 shrink-0">
          <div className="relative">
            <CalendarDays className="h-3.5 w-3.5 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded pl-6 pr-1 py-1 text-[11px] bg-white"
            />
          </div>
          <span className="text-[11px] text-gray-500">to</span>
          <div className="relative">
            <CalendarDays className="h-3.5 w-3.5 absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded pl-6 pr-1 py-1 text-[11px] bg-white"
            />
          </div>
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="p-1 rounded hover:bg-gray-100"
              title="Clear dates"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto meeting-scroll-admin pr-1">
        <div className="flex flex-col gap-3">
          {reminders?.length > 0 ? (
            reminders.map((activity) => (
              <div
                key={activity._id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {activity.clientName || "Unknown Client"}
                    </h3>
                    {activity.company && (
                      <p className="text-xs text-gray-500 truncate">
                        {activity.company}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      {new Date(activity.reminderAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                        activity.updateType === "call"
                          ? "bg-blue-100 text-blue-700"
                          : activity.updateType === "meeting"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.updateType}
                    </span>
                    {activity.status && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-yellow-50 text-yellow-700 border border-yellow-100">
                        {String(activity.status).replace(/-/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
                {activity.note && (
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                    <p className="line-clamp-3">{activity.note}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <p className="text-sm">No reminders in this range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaySalesReminder;
