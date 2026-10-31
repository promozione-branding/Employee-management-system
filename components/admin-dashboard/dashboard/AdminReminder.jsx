// components/admin-dashboard/dashboard/AdminReminder.jsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign, Bell, CalendarDays, X } from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { getAllEmailService } from "@/service/team-update";
import {
  createAdminReminderService,
  getAdminReminderService,
  getAdminClientRemindersService,
  createManagerReminderService,
  getManagerReminderService,
} from "@/service/admin-dashboard/dashboard-api";
import { useAdminStore } from "@/lib/store/AdminStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "mine", label: "My Reminders" },
  { id: "clients", label: "Client Reminders" },
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

const SCROLLBAR_CSS = `
  .reminder-scroll::-webkit-scrollbar { width: 6px; }
  .reminder-scroll::-webkit-scrollbar-track { background: transparent; }
  .reminder-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
  .reminder-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .reminder-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  }
`;

const AdminReminder = () => {
  const pathname = usePathname();
  const isManager = pathname?.startsWith("/manager");

  const [activeTab, setActiveTab] = useState("mine");

  // ------- My Reminders -------
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);
  const [ccMailShow, setCcMailShow] = useState(false);

  const { adminDetail } = useAdminStore();

  /* ================= MY REMINDERS ================= */
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await getAdminReminderService(adminDetail?._id);
      setReminders(res?.data?.reminder || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!description || !reminderAt) {
        return toast.error("Fill all fields");
      }
      const localDate = new Date(reminderAt);
      const res = await createAdminReminderService({
        userId: adminDetail?._id,
        reminder: [
          {
            description,
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
        fetchReminders();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error while creating reminder",
      );
    }
  };

  async function fetchEmail() {
    try {
      setEmailListLoading(true);
      const res = await getAllEmailService();
      if (res.success) setEmailList(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setEmailListLoading(false);
    }
  }

  const handleSelectEmail = (email) => {
    setSelectEmail((prev) =>
      prev.some((s) => s?._id === email?._id)
        ? prev.filter((s) => s._id !== email?._id)
        : [...prev, email],
    );
  };

  useEffect(() => {
    if (!adminDetail?._id) return;
    fetchReminders();
    fetchEmail();
  }, [adminDetail?._id]);

  /* ================= CLIENT REMINDERS ================= */
  const [clientReminders, setClientReminders] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [type, setType] = useState("all");
  const [preset, setPreset] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchClientReminders = useCallback(async () => {
    try {
      setClientLoading(true);
      const params = { preset, type };
      if (preset === "custom") {
        if (from) params.from = from;
        if (to) params.to = to;
      }
      const res = await getAdminClientRemindersService(params);
      if (res.success) setClientReminders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Error fetching client reminders");
    } finally {
      setClientLoading(false);
    }
  }, [preset, type, from, to]);

  useEffect(() => {
    if (activeTab === "clients") fetchClientReminders();
  }, [activeTab, fetchClientReminders]);

  /* ================= RENDER ================= */
  return (
    <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 h-[70vh] lg:h-[68vh] overflow-hidden flex flex-col">
      <style>{SCROLLBAR_CSS}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-600" />
          <h2 className="text-xl font-bold">Reminders</h2>
        </div>
        {activeTab === "mine" && (
          <div
            onClick={() => setCcMailShow((prev) => !prev)}
            className={`cursor-pointer ${ccMailShow ? "text-orange-500" : "text-black"}`}
          >
            <AtSign />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 shrink-0">
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

      {/* ================= MY REMINDERS TAB ================= */}
      {activeTab === "mine" && (
        <>
          <div className="flex flex-col md:flex-row gap-3 mb-6 w-full shrink-0">
            <Input
              placeholder="Reminder description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={"border w-[60vw] border-black"}
            />
            <Input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className={"border w-[40vw] border-black"}
            />
            <Button onClick={handleCreate}>Add</Button>
          </div>

          {ccMailShow && (
            <div className="flex flex-wrap gap-3 mb-4 shrink-0">
              {emailList?.map((item) => (
                <button
                  key={item?._id}
                  onClick={() => handleSelectEmail(item)}
                  className={`p-1 border rounded-lg shadow-sm text-sm font-medium text-gray-700 duration-300 capitalize ${
                    selectEmail.some((s) => s?._id === item?._id)
                      ? "bg-blue-50 border-emerald-500 scale-105"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  @{item?.email?.split("@")?.[0]}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto reminder-scroll">
            {loading ? (
              <ul className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="p-3 border rounded-lg bg-white">
                    <Skeleton height={20} width="70%" />
                    <Skeleton height={14} width="40%" className="mt-2" />
                  </li>
                ))}
              </ul>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-slate-500">No reminders added</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        ⏰ {new Date(item.reminderAt).toLocaleString()}
                      </p>
                      {item.reminderSend && (
                        <span className="text-green-600 text-xs font-semibold">
                          ✔ Sent
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

      {/* ================= CLIENT REMINDERS TAB ================= */}
      {activeTab === "clients" && (
        <>
          {/* Type tabs */}
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

          {/* Date presets */}
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

          {/* List */}
          <div className="flex-1 min-h-0 overflow-y-auto reminder-scroll pr-1">
            {clientLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} height={70} borderRadius={8} />
                ))}
              </div>
            ) : clientReminders.length === 0 ? (
              <p className="text-sm text-slate-500">
                No client reminders in this range.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {clientReminders.map((activity) => {
                  const clientBase = isManager
                    ? "/manager/customer"
                    : "/dashboard/customer";
                  return (
                    <Link
                      key={activity._id}
                      href={`${clientBase}/${activity.clientId}`}
                      className="block"
                    >
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all">
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
                              ⏰{" "}
                              {new Date(activity.reminderAt).toLocaleString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                                activity.updateType === "call"
                                  ? "bg-blue-100 text-blue-600"
                                  : activity.updateType === "meeting"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {activity.updateType}
                            </span>
                            {activity.status && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-yellow-50 text-yellow-600 border border-yellow-100">
                                {String(activity.status).replace(/-/g, " ")}
                              </span>
                            )}
                          </div>
                        </div>
                        {activity.note && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            <p className="line-clamp-2">{activity.note}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReminder;
