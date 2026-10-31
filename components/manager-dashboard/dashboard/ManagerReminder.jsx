
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Clock, Users } from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

import {
  getAdminClientRemindersService,
} from "@/service/admin-dashboard/dashboard-api";

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "call", label: "Calls" },
  { id: "meeting", label: "Meetings" },
  { id: "general", label: "General" },
];

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "next7", label: "Next 7 Days" },
  { id: "custom", label: "Custom" },
];

export default function ManagerReminder() {
  const pathname = usePathname();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("all");
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);

      const params = { preset, type };

      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }

      const res = await getAdminClientRemindersService(params);

      if (res?.success) {
        setReminders(res.data || []);
      } else {
        setReminders([]);
        toast.error(res?.message || "Unable to load reminders");
      }
    } catch (error) {
      setReminders([]);
      toast.error(
        error?.response?.data?.message ||
          "Unable to load client reminders",
      );
    } finally {
      setLoading(false);
    }
  }, [preset, type, from, to]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const customerBase = pathname?.startsWith("/manager")
    ? "/manager/customer"
    : "/manager/customer";

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const typeStyle = {
    call: "bg-blue-100 text-blue-700",
    meeting: "bg-purple-100 text-purple-700",
    general: "bg-gray-100 text-gray-700",
  };

  return (
    <section className="flex h-[70vh] flex-col overflow-hidden rounded-lg bg-[#f3eaea] p-5 shadow-md lg:h-[68vh]">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-600" size={22} />

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Client Reminders
            </h2>

            <p className="text-xs text-slate-500">
              Your customer follow-ups and meeting reminders
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchReminders}
          disabled={loading}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Activity type filters */}
      <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setType(tab.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              type === tab.id
                ? "border-gray-800 bg-gray-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
        {DATE_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreset(item.id)}
            className={`rounded border px-2 py-1.5 text-[11px] font-medium transition ${
              preset === item.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {preset === "custom" && (
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded border bg-white px-2">
            <CalendarDays size={14} className="text-gray-400" />

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="min-w-0 bg-transparent py-1.5 text-xs outline-none"
              aria-label="Start date"
            />
          </div>

          <span className="text-xs text-gray-500">to</span>

          <div className="flex items-center gap-1 rounded border bg-white px-2">
            <CalendarDays size={14} className="text-gray-400" />

            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="min-w-0 bg-transparent py-1.5 text-xs outline-none"
              aria-label="End date"
            />
          </div>
        </div>
      )}

      {/* Reminder list */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                height={86}
                borderRadius={8}
              />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex h-full min-h-36 flex-col items-center justify-center text-center">
            <Bell size={30} className="mb-2 text-gray-400" />

            <p className="text-sm font-medium text-gray-700">
              No client reminders found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try another date range or activity type.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reminders.map((activity) => (
              <Link
                key={activity._id}
                href={`${customerBase}/${activity.clientId}?tab=meeting`}
                key={activity._id}
                className="block rounded-lg border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-800">
                      {activity.clientName || "Unknown Customer"}
                    </h3>

                    {activity.company && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {activity.company}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${
                      typeStyle[activity.updateType] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {activity.updateType || "Update"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={13} className="shrink-0" />

                  <span>{formatDate(activity.reminderAt)}</span>
                </div>

                {activity.status && (
                  <div className="mt-2">
                    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700">
                      {String(activity.status).replace(/-/g, " ")}
                    </span>
                  </div>
                )}

                {activity.note && (
                  <p className="mt-2 line-clamp-2 rounded-md bg-gray-50 p-2 text-xs leading-relaxed text-gray-600">
                    {activity.note}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600">
                  <Users size={12} />
                  View customer update
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
