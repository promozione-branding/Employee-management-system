
"use client";

// components/admin-dashboard/dashboard/AdminReminder.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  AtSign,
  Bell,
  CalendarDays,
  X,
  Clock,
  CheckCircle2,
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

// ========================================
// CONFIGURATION
// ========================================

const TABS = [
  { id: "mine", label: "My reminders" },
  { id: "clients", label: "Client reminders" },
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
  cream: "#FFF3D9",
  bg: "#F2F4F9",
  card: "#FFFFFF",
  card2: "#F7F8FC",
  ink: "#0F1B33",
  muted: "#56647D",
  faint: "#8793AA",
  line: "#E1E7F0",
  green: "#16865D",
  red: "#DC2626",
  violet: "#7050E8",
  amber: "#B86A00",
};

// ========================================
// SCROLLBAR
// ========================================

const SCROLLBAR_CSS = `
  .reminder-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .reminder-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .reminder-scroll::-webkit-scrollbar-thumb {
    background: #DDE4EF;
    border-radius: 999px;
  }

  .reminder-scroll::-webkit-scrollbar-thumb:hover {
    background: #AEBBD0;
  }

  .reminder-scroll {
    scrollbar-width: thin;
    scrollbar-color: #DDE4EF transparent;
  }
`;

// ========================================
// DATE HELPERS
// ========================================

const formatReminderDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isOverdue = (date) => {
  const parsedDate = new Date(date);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getTime() < Date.now()
  );
};

// ========================================
// CLIENT REMINDER TYPE STYLE
// ========================================

const getTypeStyle = (type) => {
  switch (type?.toLowerCase()) {
    case "call":
      return {
        icon: Phone,
        label: "Call",
        color: "#16865D",
        background: "#E5F5EC",
        border: "#C6EAD6",
      };

    case "meeting":
      return {
        icon: Video,
        label: "Meeting",
        color: "#2B5086",
        background: "#E9EFF9",
        border: "#D5E1F4",
      };

    default:
      return {
        icon: FileText,
        label: type || "General",
        color: "#7050E8",
        background: "#EDE9FC",
        border: "#E1DAFA",
      };
  }
};

// ========================================
// MAIN COMPONENT
// ========================================

const AdminReminder = () => {
  const pathname = usePathname();

  const isManager = pathname?.startsWith("/manager");

  const clientBase = isManager
    ? "/manager/customer"
    : "/dashboard/customer";

  const { adminDetail } = useAdminStore();

  // Main tabs
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

  // ========================================
  // OPEN REMINDER COUNT
  // ========================================

  const openCount = useMemo(() => {
    return reminders.filter((item) => !item.reminderSend).length;
  }, [reminders]);

  // ========================================
  // FETCH PERSONAL REMINDERS
  // ========================================

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

  // ========================================
  // FETCH EMAIL LIST
  // ========================================

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

  // ========================================
  // CREATE REMINDER
  // ========================================

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

  // ========================================
  // SELECT EMAIL
  // ========================================

  const handleSelectEmail = (email) => {
    setSelectEmail((prev) =>
      prev.some((item) => item?._id === email?._id)
        ? prev.filter((item) => item?._id !== email?._id)
        : [...prev, email]
    );
  };

  // ========================================
  // INITIAL FETCH
  // ========================================

  useEffect(() => {
    if (!adminDetail?._id) return;

    fetchReminders();
    fetchEmail();
  }, [adminDetail?._id, fetchReminders, fetchEmail]);

  // ========================================
  // FETCH CLIENT REMINDERS
  // ========================================

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

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      className="
        flex
        h-[595px]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
        transition-shadow
        duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:p-[22px]
      "
      style={{
        borderColor: COLORS.line,
      }}
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-5 flex shrink-0 items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          {/* Bell icon */}
          <div
            className="
              flex
              h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
            "
            style={{
              background: COLORS.cream,
              color: COLORS.amber,
            }}
          >
            <Bell size={21} strokeWidth={1.8} />
          </div>

          {/* Title */}
          <div className="min-w-0">

            <h2
              className="
                font-serif
                text-[21px]
                font-bold
                leading-tight
                tracking-tight
              "
              style={{ color: COLORS.navy }}
            >
              Reminders
            </h2>

            <p
              className="mt-1 text-[13px]"
              style={{ color: COLORS.muted }}
            >
              {openCount} open
            </p>

          </div>

        </div>

        {/* CC EMAIL CONTROL - EXISTING FUNCTIONALITY */}

        {activeTab === "mine" && (
          <button
            type="button"
            onClick={() => setCcMailShow((prev) => !prev)}
            aria-label="Toggle CC email recipients"
            aria-pressed={ccMailShow}
            title="CC email recipients"
            className="
              relative
              flex h-9 w-9
              shrink-0
              items-center justify-center
              rounded-xl
              border
              transition-colors
              hover:bg-[#FFF3D9]
            "
            style={{
              borderColor: ccMailShow ? COLORS.orange : COLORS.line,
              background: ccMailShow ? COLORS.cream : COLORS.white,
              color: ccMailShow ? COLORS.orange : COLORS.muted,
            }}
          >
            <AtSign size={17} />

            {selectEmail.length > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex h-5 min-w-5
                  items-center justify-center
                  rounded-full
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                "
                style={{ background: COLORS.orange }}
              >
                {selectEmail.length}
              </span>
            )}
          </button>
        )}

      </div>

      {/* ================================== */}
      {/* MAIN SEGMENTED TABS */}
      {/* ================================== */}

      <div
        className="
          mb-3
          grid
          shrink-0
          grid-cols-2
          gap-1
          rounded-[13px]
          border
          p-1
        "
        style={{
          borderColor: COLORS.line,
          background: COLORS.card2,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={active}
              className="
                flex h-[35px]
                items-center
                justify-center
                rounded-[10px]
                text-[13px]
                font-semibold
                transition-all
                duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#F27B1E]
              "
              style={{
                background: active ? COLORS.white : "transparent",
                color: active ? COLORS.ink : COLORS.muted,
                boxShadow: active
                  ? "0 1px 3px rgba(10,46,102,.08)"
                  : "none",
                border: active
                  ? `1px solid ${COLORS.line}`
                  : "1px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================== */}
      {/* MY REMINDERS */}
      {/* ================================== */}

      {activeTab === "mine" && (
        <>
          {/* CREATE REMINDER FORM */}

          <div className="shrink-0">

            <div className="flex flex-col gap-2">

              {/* Description */}
              <input
                type="text"
                placeholder="What should you remember?"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="
                  h-[42px]
                  w-full
                  min-w-0
                  rounded-[12px]
                  border-[1.5px]
                  bg-white
                  px-3
                  text-[14px]
                  outline-none
                  transition-all
                  placeholder:text-[#8793AA]
                  focus:border-[#0A2E66]
                  focus:ring-2
                  focus:ring-[#F27B1E]/10
                "
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.ink,
                }}
              />

              {/* Date + Add */}
              <div className="grid grid-cols-[minmax(0,1fr)_60px] gap-2">

                <input
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(event) =>
                    setReminderAt(event.target.value)
                  }
                  className="
                    h-[42px]
                    w-full
                    min-w-0
                    rounded-[12px]
                    border-[1.5px]
                    bg-white
                    px-3
                    text-[13px]
                    outline-none
                    transition-all
                    focus:border-[#0A2E66]
                    focus:ring-2
                    focus:ring-[#F27B1E]/10
                  "
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.ink,
                  }}
                />

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="
                    flex
                    h-[42px]
                    items-center
                    justify-center
                    rounded-[12px]
                    border-b-[3px]
                    border-[#F27B1E]
                    bg-[#0A2E66]
                    px-3
                    text-[14px]
                    font-bold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-[#12397A]
                    active:scale-[0.97]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {creating ? "..." : "Add"}
                </button>

              </div>

            </div>

          </div>

          {/* ================================== */}
          {/* CC EMAIL SELECTOR */}
          {/* ================================== */}

          {ccMailShow && (
            <div
              className="
                mt-3
                shrink-0
                rounded-xl
                border
                p-3
              "
              style={{
                borderColor: COLORS.line,
                background: COLORS.card2,
              }}
            >

              <div className="mb-2 flex items-center justify-between gap-2">

                <div>
                  <p
                    className="text-xs font-bold"
                    style={{ color: COLORS.ink }}
                  >
                    CC recipients
                  </p>

                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: COLORS.muted }}
                  >
                    Select email addresses to include
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    px-2 py-1
                    text-[10px]
                    font-bold
                  "
                  style={{
                    background: COLORS.cream,
                    color: COLORS.orange,
                  }}
                >
                  {selectEmail.length} selected
                </span>

              </div>

              {emailListLoading ? (

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      width={110}
                      height={30}
                      borderRadius={999}
                    />
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
                        className="
                          inline-flex
                          max-w-full
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          px-3 py-1.5
                          text-xs
                          font-bold
                          transition-colors
                        "
                        style={{
                          borderColor: selected
                            ? COLORS.orange
                            : COLORS.line,
                          background: selected
                            ? COLORS.cream
                            : COLORS.white,
                          color: selected
                            ? COLORS.navy
                            : COLORS.muted,
                        }}
                      >
                        {selected && (
                          <CheckCircle2
                            size={14}
                            className="shrink-0"
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
                <p
                  className="text-xs"
                  style={{ color: COLORS.muted }}
                >
                  No email recipients available.
                </p>
              )}

            </div>
          )}

          {/* ================================== */}
          {/* PERSONAL REMINDER LIST */}
          {/* ================================== */}

          <div
            className="
              reminder-scroll
              min-h-0
              flex-1
              overflow-x-hidden
              overflow-y-auto
              pt-3
              pr-1
            "
          >

            {loading ? (

              <div className="space-y-2.5">

                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="
                      rounded-[15px]
                      border
                      p-3
                    "
                    style={{ borderColor: COLORS.line }}
                  >
                    <Skeleton height={15} width="70%" />

                    <div className="mt-2">
                      <Skeleton height={12} width="45%" />
                    </div>
                  </div>
                ))}

              </div>

            ) : reminders.length === 0 ? (

              <div
                className="
                  flex
                  min-h-[150px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[15px]
                  border
                  border-dashed
                  px-4
                  py-6
                  text-center
                "
                style={{
                  borderColor: COLORS.line,
                  background: COLORS.card2,
                }}
              >

                <div
                  className="
                    mb-3
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                  "
                  style={{
                    background: COLORS.cream,
                    color: COLORS.amber,
                  }}
                >
                  <Bell size={21} />
                </div>

                <p
                  className="text-sm font-bold"
                  style={{ color: COLORS.ink }}
                >
                  No reminders yet
                </p>

                <p
                  className="
                    mt-1
                    max-w-[240px]
                    text-xs
                    leading-5
                  "
                  style={{ color: COLORS.muted }}
                >
                  Add a reminder above to keep an important task on your radar.
                </p>

              </div>

            ) : (

              <ul className="space-y-2.5">

                {reminders.map((item) => {
                  const overdue =
                    isOverdue(item.reminderAt) &&
                    !item.reminderSend;

                  return (
                    <li
                      key={item._id}
                      className="
                        group
                        flex
                        min-w-0
                        items-start
                        gap-3
                        rounded-[15px]
                        border
                        px-3
                        py-3.5
                        transition-colors
                        duration-200
                        hover:bg-[#F7F8FC]
                        sm:px-3.5
                      "
                      style={{
                        borderColor: COLORS.line,
                        background: COLORS.white,
                      }}
                    >

                      {/* Visual checkbox */}
                      <div
                        className="
                          mt-[3px]
                          flex
                          h-[24px]
                          w-[24px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-[8px]
                          border-2
                          bg-white
                        "
                        style={{
                          borderColor: COLORS.faint,
                        }}
                        aria-hidden="true"
                      />

                      {/* Reminder content */}
                      <div className="min-w-0 flex-1">

                        <p
                          className="
                            break-words
                            text-[14px]
                            font-semibold
                            leading-5
                          "
                          style={{ color: COLORS.ink }}
                        >
                          {item.description}
                        </p>

                        <p
                          className="
                            mt-1
                            flex
                            flex-wrap
                            items-center
                            gap-1
                            text-[12px]
                            leading-4
                          "
                          style={{
                            color: overdue
                              ? COLORS.red
                              : COLORS.muted,
                          }}
                        >
                          {overdue ? (
                            <>
                              <span className="font-medium">
                                Overdue,
                              </span>
                              <span>
                                {formatReminderDate(item.reminderAt)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock
                                size={12}
                                className="shrink-0"
                              />
                              {formatReminderDate(item.reminderAt)}
                            </>
                          )}
                        </p>

                        {item.reminderSend && (
                          <span
                            className="
                              mt-2
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              px-2
                              py-1
                              text-[10px]
                              font-bold
                            "
                            style={{
                              color: COLORS.green,
                              background: "#E5F5EC",
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Sent
                          </span>
                        )}

                      </div>

                    </li>
                  );
                })}

              </ul>

            )}

          </div>
        </>
      )}

      {/* ================================== */}
      {/* CLIENT REMINDERS */}
      {/* ================================== */}

      {activeTab === "clients" && (
        <>

          {/* CLIENT FILTERS */}

          <div
            className="
              shrink-0
              space-y-3
              border-b
              py-3
            "
            style={{ borderColor: COLORS.line }}
          >

            {/* Activity type */}
            <div>

              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                "
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
                    className="
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[11px]
                      font-bold
                      transition-all
                    "
                    style={{
                      borderColor:
                        type === item.id
                          ? COLORS.navy
                          : COLORS.line,
                      background:
                        type === item.id
                          ? COLORS.navy
                          : COLORS.white,
                      color:
                        type === item.id
                          ? COLORS.white
                          : COLORS.muted,
                    }}
                  >
                    {item.label}
                  </button>
                ))}

              </div>

            </div>

            {/* Date presets */}
            <div>

              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                "
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
                    className="
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[11px]
                      font-bold
                      transition-all
                    "
                    style={{
                      borderColor:
                        preset === item.id
                          ? COLORS.navy
                          : COLORS.line,
                      background:
                        preset === item.id
                          ? COLORS.navy
                          : COLORS.white,
                      color:
                        preset === item.id
                          ? COLORS.white
                          : COLORS.muted,
                    }}
                  >
                    {item.label}
                  </button>
                ))}

              </div>

            </div>

            {/* Custom dates */}
            {preset === "custom" && (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-2
                  rounded-xl
                  border
                  p-3
                  sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]
                "
                style={{
                  borderColor: COLORS.line,
                  background: COLORS.card2,
                }}
              >

                <label className="min-w-0">

                  <span
                    className="mb-1 block text-[11px] font-bold"
                    style={{ color: COLORS.muted }}
                  >
                    From
                  </span>

                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="
                      h-[38px]
                      w-full
                      min-w-0
                      rounded-[10px]
                      border
                      bg-white
                      px-2
                      text-xs
                      outline-none
                    "
                    style={{ borderColor: COLORS.line }}
                  />

                </label>

                <label className="min-w-0">

                  <span
                    className="mb-1 block text-[11px] font-bold"
                    style={{ color: COLORS.muted }}
                  >
                    To
                  </span>

                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => setTo(event.target.value)}
                    className="
                      h-[38px]
                      w-full
                      min-w-0
                      rounded-[10px]
                      border
                      bg-white
                      px-2
                      text-xs
                      outline-none
                    "
                    style={{ borderColor: COLORS.line }}
                  />

                </label>

                {(from || to) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-1.5
                      self-end
                      rounded-lg
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-white
                    "
                    style={{ color: COLORS.muted }}
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}

              </div>
            )}

          </div>

          {/* ================================== */}
          {/* CLIENT REMINDER RESULTS */}
          {/* ================================== */}

          <div
            className="
              reminder-scroll
              min-h-0
              flex-1
              overflow-x-hidden
              overflow-y-auto
              py-3
              pr-1
            "
          >

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
                className="
                  flex
                  min-h-[180px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[15px]
                  border
                  border-dashed
                  px-4
                  py-8
                  text-center
                "
                style={{
                  borderColor: COLORS.line,
                  background: COLORS.card2,
                }}
              >

                <div
                  className="
                    mb-3
                    flex h-11 w-11
                    items-center
                    justify-center
                    rounded-xl
                  "
                  style={{
                    background: "#E9EFF9",
                    color: "#2B5086",
                  }}
                >
                  <UsersRound size={21} />
                </div>

                <p
                  className="text-sm font-bold"
                  style={{ color: COLORS.ink }}
                >
                  No client reminders found
                </p>

                <p
                  className="
                    mt-1
                    max-w-[240px]
                    text-xs
                    leading-5
                  "
                  style={{ color: COLORS.muted }}
                >
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
                      className="
                        group
                        block
                        rounded-xl
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-offset-2
                      "
                      style={{ "--tw-ring-color": COLORS.orange }}
                    >

                      <article
                        className="
                          rounded-[15px]
                          border
                          p-3.5
                          transition-all
                          duration-200
                          group-hover:shadow-sm
                          sm:p-4
                        "
                        style={{
                          borderColor: COLORS.line,
                          background: COLORS.white,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.borderColor =
                            COLORS.orangeLight;
                          event.currentTarget.style.background =
                            COLORS.card2;
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.borderColor =
                            COLORS.line;
                          event.currentTarget.style.background =
                            COLORS.white;
                        }}
                      >

                        <div className="flex min-w-0 items-start gap-3">

                          <div
                            className="
                              flex h-10 w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                            "
                            style={{
                              background: typeStyle.background,
                              color: typeStyle.color,
                            }}
                          >
                            <TypeIcon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="
                              flex
                              min-w-0
                              flex-wrap
                              items-start
                              justify-between
                              gap-2
                            ">

                              <div className="min-w-0 flex-1">

                                <h3
                                  className="
                                    break-words
                                    text-sm
                                    font-bold
                                  "
                                  style={{ color: COLORS.ink }}
                                >
                                  {activity.clientName || "Unknown Client"}
                                </h3>

                                {activity.company && (
                                  <p
                                    className="mt-0.5 truncate text-xs"
                                    style={{ color: COLORS.muted }}
                                  >
                                    {activity.company}
                                  </p>
                                )}

                              </div>

                              <span
                                className="
                                  shrink-0
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  capitalize
                                "
                                style={{
                                  background: typeStyle.background,
                                  color: typeStyle.color,
                                }}
                              >
                                {typeStyle.label}
                              </span>

                            </div>

                            <p
                              className="
                                mt-2
                                flex
                                flex-wrap
                                items-center
                                gap-1.5
                                text-xs
                              "
                              style={{ color: COLORS.muted }}
                            >
                              <CalendarDays size={14} className="shrink-0" />
                              {formatReminderDate(activity.reminderAt)}
                            </p>

                            {activity.status && (
                              <span
                                className="
                                  mt-2
                                  inline-flex
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  capitalize
                                "
                                style={{
                                  background: String(activity.status)
                                    .toLowerCase()
                                    .includes("complete")
                                    ? "#E5F5EC"
                                    : "#FFF4D9",
                                  color: String(activity.status)
                                    .toLowerCase()
                                    .includes("complete")
                                    ? COLORS.green
                                    : COLORS.amber,
                                  borderColor: String(activity.status)
                                    .toLowerCase()
                                    .includes("complete")
                                    ? "#C6EAD6"
                                    : "#F1DFAA",
                                }}
                              >
                                {String(activity.status).replace(/-/g, " ")}
                              </span>
                            )}

                          </div>

                        </div>

                        {activity.note && (
                          <p
                            className="
                              mt-3
                              line-clamp-2
                              whitespace-pre-wrap
                              break-words
                              rounded-lg
                              border
                              px-3
                              py-2
                              text-xs
                              leading-5
                            "
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
