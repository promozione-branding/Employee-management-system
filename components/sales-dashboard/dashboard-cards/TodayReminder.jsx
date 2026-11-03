"use client";

import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";
import { todayReminderService } from "@/service/sales-dashboard/dashboard-api";
import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  BellRing,
  CalendarDays,
  Clock3,
  Phone,
  UsersRound,
  ClipboardList,
  X,
} from "lucide-react";

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

  const [type, setType] = useState("all");
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReminders = useCallback(async () => {
    if (!employee?.user?._id) {
      setReminders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = { preset, type };

      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }

      const res = await todayReminderService(employee.user._id, params);

      if (res.success) {
        setReminders(res?.data || []);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);

      toast.error(error?.response?.data?.message || "Error fetching reminders");
    } finally {
      setLoading(false);
    }
  }, [employee, preset, type, from, to]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const formatReminderDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getReminderIcon = (updateType) => {
    if (updateType === "call") return Phone;
    if (updateType === "meeting") return UsersRound;
    return ClipboardList;
  };

  const getReminderColors = (updateType) => {
    if (updateType === "call") {
      return {
        icon: "bg-blue-50 text-blue-700",
        badge: "border-blue-100 bg-blue-50 text-blue-700",
      };
    }

    if (updateType === "meeting") {
      return {
        icon: "bg-orange-50 text-[#C56816]",
        badge: "border-orange-100 bg-orange-50 text-[#C56816]",
      };
    }

    return {
      icon: "bg-[#F0F3F8] text-[#0A2E66]",
      badge: "border-[#E3E7F0] bg-[#F0F3F8] text-[#0A2E66]",
    };
  };

  return (
    <div className="flex h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white">
          <BellRing size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
            Reminders
          </h2>

          <p className="mt-0.5 text-xs text-[#8A92A6]">
            Stay on top of follow-ups
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {reminders.length}
        </span>
      </div>

      {/* Type filters */}
      <div className="mb-2 flex shrink-0 flex-wrap gap-1.5">
        {TYPE_TABS.map((tab) => {
          const active = type === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setType(tab.id)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                active
                  ? "border-[#0A2E66] bg-[#0A2E66] text-white"
                  : "border-[#E3E7F0] bg-white text-[#596579] hover:border-[#F27B1E] hover:text-[#0A2E66]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date presets */}
      <div className="mb-3 flex shrink-0 flex-wrap gap-1.5">
        {DATE_PRESETS.map((item) => {
          const active = preset === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id)}
              className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all ${
                active
                  ? "border-[#F27B1E] bg-orange-50 text-[#B85D12]"
                  : "border-[#E3E7F0] bg-white text-[#596579] hover:border-[#D5DEEF]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Custom dates */}
      {preset === "custom" && (
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Reminder start date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="min-w-0 max-w-full rounded-lg border border-[#E3E7F0] bg-white px-2 py-1.5 text-xs text-[#26344D] outline-none focus:border-[#0A2E66]"
          />

          <span className="text-xs text-[#8A92A6]">to</span>

          <input
            type="date"
            aria-label="Reminder end date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="min-w-0 max-w-full rounded-lg border border-[#E3E7F0] bg-white px-2 py-1.5 text-xs text-[#26344D] outline-none focus:border-[#0A2E66]"
          />

          {(from || to) && (
            <button
              type="button"
              title="Clear dates"
              aria-label="Clear date range"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="rounded-lg p-1.5 text-[#8A92A6] transition hover:bg-[#F0F3F8] hover:text-[#0A2E66]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Reminder list */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                height={78}
                borderRadius={12}
                baseColor="#F0F3F8"
                highlightColor="#FAFBFD"
              />
            ))}
          </div>
        ) : reminders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reminders.map((reminder) => {
              const updateType = String(
                reminder.updateType || "general",
              ).toLowerCase();

              const Icon = getReminderIcon(updateType);
              const colors = getReminderColors(updateType);

              return (
                <div
                  key={reminder._id}
                  className="min-w-0 rounded-xl border border-[#E9EDF4] bg-[#FAFBFD] p-3 transition-all duration-200 hover:border-[#D5DEEF] hover:bg-white hover:shadow-[0_4px_14px_rgba(15,27,51,0.05)]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Reminder icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Reminder details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-sm font-semibold leading-5 text-[#26344D]">
                        {reminder.clientName || "Unknown client"}
                      </h3>

                      {reminder.company && (
                        <p className="mt-0.5 truncate text-xs text-[#8A92A6]">
                          {reminder.company}
                        </p>
                      )}

                      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-[#929BAD]">
                        <Clock3 size={12} className="shrink-0" />

                        <span className="break-words">
                          {formatReminderDate(reminder.reminderAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Type and status */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${colors.badge}`}
                    >
                      {reminder.updateType || "general"}
                    </span>

                    {reminder.status && (
                      <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-semibold capitalize text-[#C56816]">
                        {String(reminder.status).replace(/-/g, " ")}
                      </span>
                    )}
                  </div>

                  {/* Optional note */}
                  {reminder.note && (
                    <div className="mt-3 rounded-lg border border-[#EDF0F5] bg-white p-2.5">
                      <p className="line-clamp-3 break-words text-xs leading-5 text-[#596579]">
                        {reminder.note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F3F8] text-[#8A92A6]">
              <BellRing size={20} />
            </div>

            <h3 className="text-sm font-semibold text-[#26344D]">
              No reminders found
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#929BAD]">
              There are no reminders for the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-[#EDF0F5] pt-3">
        <span className="text-[11px] font-medium text-[#929BAD]">
          Reminder overview
        </span>

        <span className="rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
          {reminders.length} Reminders
        </span>
      </div>
    </div>
  );
};

export default TodaySalesReminder;
