
// components/admin-dashboard/dashboard/AdminReminder.jsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AtSign,
  Bell,
  CalendarDays,
  X,
  Clock,
  CheckCircle2,
  UserRound,
  UsersRound,
  Phone,
  Video,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllEmailService } from "@/service/team-update";
import {
  createAdminReminderService,
  getAdminReminderService,
  getAdminClientRemindersService,
} from "@/service/admin-dashboard/dashboard-api";
import { useAdminStore } from "@/lib/store/AdminStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "mine", label: "My Reminders", icon: Bell },
  { id: "clients", label: "Client Reminders", icon: UsersRound },
];

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "next3", label: "Next 3 Days" },
  { id: "next7", label: "Next 7 Days" },
  { id: "custom", label: "Custom" },
];

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "call", label: "Call" },
  { id: "meeting", label: "Meeting" },
  { id: "general", label: "General" },
];

const COLORS = {
  navy: "#0A2E66",
  navy2: "#12397A",
  orange: "#F27B1E",
  orangeLight: "#F7A25C",
  cream: "#FFF5EB",
  bg: "#F2F4F9",
  card: "#FFFFFF",
  card2: "#F7F8FC",
  ink: "#0F1B33",
  muted: "#5B6478",
  faint: "#8A92A6",
  line: "#E3E7F0",
  green: "#17845A",
  red: "#CC3B32",
  violet: "#6A4FD6",
  amber: "#B86A00",
};

const SCROLLBAR_CSS = `
  .reminder-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .reminder-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .reminder-scroll::-webkit-scrollbar-thumb {
    background: #cbd2df;
    border-radius: 999px;
  }

  .reminder-scroll::-webkit-scrollbar-thumb:hover {
    background: #8A92A6;
  }

  .reminder-scroll {
    scrollbar-width: thin;
    scrollbar-color: #cbd2df transparent;
  }

  .reminder-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 5px 11px;
    border: 1px solid #E3E7F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #5B6478;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    transition: all .15s ease;
  }

  .reminder-chip:hover {
    border-color: #8A92A6;
    color: #0F1B33;
  }

  .reminder-chip[aria-pressed="true"] {
    border-color: #0A2E66;
    background: #0A2E66;
    color: #FFFFFF;
  }

  .reminder-date-input {
    width: 100%;
    min-width: 0;
    height: 38px;
    border: 1.5px solid #E3E7F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #0F1B33;
    padding: 0 9px;
    font-size: 12px;
    outline: none;
  }

  .reminder-date-input:focus {
    border-color: #0A2E66;
    box-shadow: 0 0 0 3px rgba(242, 123, 30, .16);
  }
`;

const formatReminderDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
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

const getTypeStyle = (type) => {
  switch (type?.toLowerCase()) {
    case "call":
      return {
        icon: Phone,
        label: "Call",
        color: "#17845A",
        background: "#E5F5EC",
        border: "#c6ead6",
      };

    case "meeting":
      return {
        icon: Video,
        label: "Meeting",
        color: "#2B5086",
        background: "#E9EFF9",
        border: "#d5e1f4",
      };

    default:
      return {
        icon: FileText,
        label: type || "General",
        color: "#6A4FD6",
        background: "#EFEBFC",
        border: "#e1dafa",
      };
  }
};

const AdminReminder = () => {
  const pathname = usePathname();
  const isManager = pathname?.startsWith("/manager");
  const clientBase = isManager
    ? "/manager/customer"
    : "/dashboard/customer";

  const { adminDetail } = useAdminStore();

  const [activeTab, setActiveTab] = useState("mine");

  // My reminders
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);
  const [ccMailShow, setCcMailShow] = useState(false);
  const [creating, setCreating] = useState(false);

  // Client reminders
  const [clientReminders, setClientReminders] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [type, setType] = useState("all");
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminReminderService(adminDetail?._id);
      setReminders(res?.data?.reminder || []);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    } finally {
      setLoading(false);
    }
  }, [adminDetail?._id]);

  const fetchEmail = useCallback(async () => {
    try {
      setEmailListLoading(true);
      const res = await getAllEmailService();

      if (res.success) {
        setEmailList(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch email list:", error);
    } finally {
      setEmailListLoading(false);
    }
  }, []);

  const handleCreate = async () => {
    if (!description.trim() || !reminderAt) {
      toast.error("Fill all fields");
      return;
    }

    const localDate = new Date(reminderAt);

    if (Number.isNaN(localDate.getTime())) {
      toast.error("Please select a valid reminder date");
      return;
    }

    try {
      setCreating(true);

      const res = await createAdminReminderService({
        userId: adminDetail?._id,
        reminder: [
          {
            description: description.trim(),
            reminderAt: localDate,
            cc_email: selectEmail.map((item) => item?.email),
          },
        ],
      });

      if (res?.success) {
        toast.success(res.message || "Reminder created");
        setDescription("");
        setReminderAt("");
        setSelectEmail([]);
        await fetchReminders();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Error while creating reminder"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectEmail((prev) =>
      prev.some((item) => item?._id === email?._id)
        ? prev.filter((item) => item?._id !== email?._id)
        : [...prev, email]
    );
  };

  useEffect(() => {
    if (!adminDetail?._id) return;

    fetchReminders();
    fetchEmail();
  }, [adminDetail?._id, fetchReminders, fetchEmail]);

  const fetchClientReminders = useCallback(async () => {
    try {
      setClientLoading(true);

      const params = { preset, type };

      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }

      const res = await getAdminClientRemindersService(params);

      if (res.success) {
        setClientReminders(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.message || "Error fetching client reminders"
      );
    } finally {
      setClientLoading(false);
    }
  }, [preset, type, from, to]);

  useEffect(() => {
    if (activeTab === "clients") {
      fetchClientReminders();
    }
  }, [activeTab, fetchClientReminders]);

  return (
    <section
      className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-[20px] border bg-white shadow-sm lg:h-[68vh]"
      style={{
        borderColor: COLORS.line,
        boxShadow: "0 1px 2px rgba(10,46,102,.05), 0 8px 24px -12px rgba(10,46,102,.18)",
      }}
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4 sm:px-6"
        style={{ borderColor: COLORS.line }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: COLORS.cream, color: COLORS.orange }}
          >
            <Bell className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2
              className="text-lg font-black tracking-tight"
              style={{ color: COLORS.ink }}
            >
              Reminders
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: COLORS.muted }}>
              Keep track of tasks and client follow-ups
            </p>
          </div>
        </div>

        {activeTab === "mine" && (
          <button
            type="button"
            onClick={() => setCcMailShow((prev) => !prev)}
            aria-label="Toggle CC email recipients"
            aria-pressed={ccMailShow}
            title="CC email recipients"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor: ccMailShow ? COLORS.orange : COLORS.line,
              background: ccMailShow ? COLORS.cream : COLORS.card2,
              color: ccMailShow ? COLORS.orange : COLORS.muted,
            }}
          >
            <AtSign className="h-4 w-4" />
            {selectEmail.length > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black text-white"
                style={{ background: COLORS.orange }}
              >
                {selectEmail.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div
        className="flex shrink-0 gap-5 border-b px-5 sm:px-6"
        style={{ borderColor: COLORS.line }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={active}
              className="relative -mb-px inline-flex items-center gap-2 border-b-2 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: active ? COLORS.orange : "transparent",
                color: active ? COLORS.navy : COLORS.muted,
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: active ? COLORS.orange : COLORS.faint }}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* My Reminders */}
      {activeTab === "mine" && (
        <>
          <div className="shrink-0 px-5 pt-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-4 w-1 rounded-full"
                style={{ background: COLORS.orange }}
              />
              <h3
                className="text-sm font-black"
                style={{ color: COLORS.ink }}
              >
                Create a reminder
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(190px,0.8fr)_auto]">
              <Input
                placeholder="Reminder description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-[42px] min-w-0 rounded-[11px] border-[1.5px] bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-2"
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.ink,
                  "--tw-ring-color": "rgba(242,123,30,.18)",
                }}
              />

              <Input
                type="datetime-local"
                value={reminderAt}
                onChange={(event) => setReminderAt(event.target.value)}
                className="h-[42px] min-w-0 rounded-[11px] border-[1.5px] bg-white text-xs shadow-none focus-visible:ring-2"
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.ink,
                }}
              />

              <Button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="h-[42px] rounded-xl px-5 font-black text-white transition-colors hover:brightness-110 disabled:opacity-60"
                style={{
                  background: COLORS.navy,
                  boxShadow: `inset 0 -3px 0 ${COLORS.orange}`,
                }}
              >
                {creating ? "Adding..." : "Add reminder"}
              </Button>
            </div>
          </div>

          {/* CC email selector */}
          {ccMailShow && (
            <div className="mx-5 mt-3 shrink-0 rounded-xl border p-3 sm:mx-6"
              style={{
                borderColor: COLORS.line,
                background: COLORS.card2,
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black" style={{ color: COLORS.ink }}>
                    CC recipients
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: COLORS.muted }}>
                    Select email addresses to include
                  </p>
                </div>

                <span
                  className="rounded-full px-2 py-1 text-[10px] font-bold"
                  style={{ background: COLORS.cream, color: COLORS.orange }}
                >
                  {selectEmail.length} selected
                </span>
              </div>

              {emailListLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} width={110} height={30} borderRadius={999} />
                  ))}
                </div>
              ) : emailList.length > 0 ? (
                <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                  {emailList.map((item) => {
                    const selected = selectEmail.some(
                      (email) => email?._id === item?._id
                    );

                    return (
                      <button
                        key={item?._id}
                        type="button"
                        onClick={() => handleSelectEmail(item)}
                        aria-pressed={selected}
                        title={item?.email}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                        style={{
                          borderColor: selected ? COLORS.orange : COLORS.line,
                          background: selected ? COLORS.cream : COLORS.card,
                          color: selected ? COLORS.navy : COLORS.muted,
                        }}
                      >
                        {selected && (
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: COLORS.orange }}
                          />
                        )}
                        <span className="truncate">
                          {item?.email?.split("@")?.[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: COLORS.muted }}>
                  No email recipients available.
                </p>
              )}
            </div>
          )}

          {/* My reminders list */}
          <div className="reminder-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4 sm:px-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border p-4"
                    style={{ borderColor: COLORS.line, background: COLORS.card }}
                  >
                    <Skeleton height={16} width="70%" />
                    <div className="mt-2">
                      <Skeleton height={12} width="45%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reminders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center"
                style={{ borderColor: COLORS.line, background: COLORS.card2 }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: COLORS.cream, color: COLORS.orange }}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-sm font-black" style={{ color: COLORS.ink }}>
                  No reminders yet
                </p>
                <p className="mt-1 max-w-[240px] text-xs leading-5" style={{ color: COLORS.muted }}>
                  Add a reminder above to keep an important task on your radar.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {reminders.map((item) => (
                  <li
                    key={item._id}
                    className="group flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:bg-slate-50/50 sm:p-4"
                    style={{
                      borderColor: COLORS.line,
                      background: COLORS.card,
                    }}
                  >
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: COLORS.cream, color: COLORS.orange }}
                    >
                      <Clock className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="break-words text-sm font-bold leading-5"
                        style={{ color: COLORS.ink }}
                      >
                        {item.description}
                      </p>

                      <p
                        className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs"
                        style={{ color: COLORS.muted }}
                      >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {formatReminderDate(item.reminderAt)}
                      </p>

                      {item.reminderSend && (
                        <span
                          className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
                          style={{
                            color: COLORS.green,
                            background: "#E5F5EC",
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Sent
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Client Reminders */}
      {activeTab === "clients" && (
        <>
          <div className="shrink-0 space-y-3 border-b px-5 py-4 sm:px-6"
            style={{ borderColor: COLORS.line, background: COLORS.card }}
          >
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider"
                style={{ color: COLORS.faint }}
              >
                Activity type
              </p>

              <div className="flex flex-wrap gap-1.5">
                {TYPE_TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    aria-pressed={type === item.id}
                    className="reminder-chip"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider"
                style={{ color: COLORS.faint }}
              >
                Date range
              </p>

              <div className="flex flex-wrap gap-1.5">
                {DATE_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreset(item.id)}
                    aria-pressed={preset === item.id}
                    className="reminder-chip"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {preset === "custom" && (
              <div
                className="grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                style={{ borderColor: COLORS.line, background: COLORS.card2 }}
              >
                <label className="min-w-0">
                  <span className="mb-1 block text-[11px] font-bold" style={{ color: COLORS.muted }}>
                    From
                  </span>
                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="reminder-date-input"
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1 block text-[11px] font-bold" style={{ color: COLORS.muted }}>
                    To
                  </span>
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    className="reminder-date-input"
                  />
                </label>

                {(from || to) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 self-end rounded-lg px-3 py-2 text-xs font-bold transition-colors hover:bg-white"
                    style={{ color: COLORS.muted }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Client reminder results */}
          <div className="reminder-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {clientLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    height={90}
                    borderRadius={14}
                  />
                ))}
              </div>
            ) : clientReminders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center"
                style={{ borderColor: COLORS.line, background: COLORS.card2 }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "#E9EFF9", color: COLORS.blue || "#2B5086" }}
                >
                  <UsersRound className="h-5 w-5" />
                </div>
                <p className="text-sm font-black" style={{ color: COLORS.ink }}>
                  No client reminders found
                </p>
                <p className="mt-1 max-w-[240px] text-xs leading-5" style={{ color: COLORS.muted }}>
                  Try another activity type or date range.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientReminders.map((activity) => {
                  const typeStyle = getTypeStyle(activity.updateType);
                  const TypeIcon = typeStyle.icon;

                  return (
                    <Link
                      key={activity._id}
                      href={`${clientBase}/${activity.clientId}`}
                      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ "--tw-ring-color": COLORS.orange }}
                    >
                      <article
                        className="rounded-xl border p-3.5 transition-all duration-150 group-hover:shadow-sm sm:p-4"
                        style={{
                          borderColor: COLORS.line,
                          background: COLORS.card,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.borderColor = COLORS.orangeLight;
                          event.currentTarget.style.background = COLORS.card2;
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.borderColor = COLORS.line;
                          event.currentTarget.style.background = COLORS.card;
                        }}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              background: typeStyle.background,
                              color: typeStyle.color,
                            }}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="break-words text-sm font-black"
                                  style={{ color: COLORS.ink }}
                                >
                                  {activity.clientName || "Unknown Client"}
                                </h3>

                                {activity.company && (
                                  <p className="mt-0.5 truncate text-xs" style={{ color: COLORS.muted }}>
                                    {activity.company}
                                  </p>
                                )}
                              </div>

                              <span
                                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize"
                                style={{
                                  background: typeStyle.background,
                                  color: typeStyle.color,
                                }}
                              >
                                {typeStyle.label}
                              </span>
                            </div>

                            <p
                              className="mt-2 flex flex-wrap items-center gap-1.5 text-xs"
                              style={{ color: COLORS.muted }}
                            >
                              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                              {formatReminderDate(activity.reminderAt)}
                            </p>

                            {activity.status && (
                              <span
                                className="mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize"
                                style={{
                                  background:
                                    String(activity.status).toLowerCase().includes("complete")
                                      ? "#E5F5EC"
                                      : "#FFF4D9",
                                  color:
                                    String(activity.status).toLowerCase().includes("complete")
                                      ? COLORS.green
                                      : COLORS.amber,
                                  borderColor:
                                    String(activity.status).toLowerCase().includes("complete")
                                      ? "#c6ead6"
                                      : "#f1dfaa",
                                }}
                              >
                                {String(activity.status).replace(/-/g, " ")}
                              </span>
                            )}
                          </div>
                        </div>

                        {activity.note && (
                          <p
                            className="mt-3 line-clamp-2 whitespace-pre-wrap break-words rounded-lg border px-3 py-2 text-xs leading-5"
                            style={{
                              background: COLORS.card2,
                              borderColor: COLORS.line,
                              color: COLORS.muted,
                            }}
                          >
                            {activity.note}
                          </p>
                        )}
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default AdminReminder;
