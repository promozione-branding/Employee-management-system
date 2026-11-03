// components/employee-dashboard/common/EmployeeReminder.jsx

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getReminderService,
  createReminderService,
} from "@/service/employee-dashboard/reminder";
import { getAllEmailService } from "@/service/team-update";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AtSign,
  Bell,
  CalendarClock,
  Check,
  Clock3,
  Mail,
  Plus,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const formatReminderDate = (date) => {
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

const EmployeeReminder = ({ employeeId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");

  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);
  const [ccMailShow, setCcMailShow] = useState(false);

  const fetchReminders = useCallback(async () => {
    if (!employeeId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await getReminderService(employeeId);
      setReminders(res?.data?.reminder || []);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchEmail = useCallback(async () => {
    try {
      setEmailListLoading(true);

      const res = await getAllEmailService();

      if (res?.success) {
        setEmailList(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch email list:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load email list",
      );
    } finally {
      setEmailListLoading(false);
    }
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!description.trim() || !reminderAt) {
      toast.error("Enter a description and reminder date");
      return;
    }

    if (!employeeId) {
      toast.error("Employee information is not available");
      return;
    }

    const localDate = new Date(reminderAt);

    if (Number.isNaN(localDate.getTime())) {
      toast.error("Please select a valid reminder date");
      return;
    }

    try {
      setCreating(true);

      const res = await createReminderService({
        employeeId,
        description: description.trim(),
        reminderAt: localDate,
        cc_email: selectEmail.map((item) => item?.email),
      });

      if (res?.success) {
        toast.success(res.message || "Reminder created");

        setDescription("");
        setReminderAt("");
        setSelectEmail([]);

        await fetchReminders();
      } else {
        toast.error(res?.message || "Unable to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);

      toast.error(
        error?.response?.data?.message || "Error while creating reminder",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectEmail((previous) => {
      const isSelected = previous.some((item) => item?._id === email?._id);

      return isSelected
        ? previous.filter((item) => item?._id !== email?._id)
        : [...previous, email];
    });
  };

  useEffect(() => {
    fetchReminders();
    fetchEmail();
  }, [fetchReminders, fetchEmail]);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(15,27,51,0.07)] lg:h-[68vh]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#EDF0F5] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white shadow-sm">
            <Bell size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
              Reminders
            </h2>
            <p className="mt-0.5 text-xs text-[#8A92A6]">
              Keep track of important tasks
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCcMailShow((previous) => !previous)}
          aria-expanded={ccMailShow}
          aria-label={
            ccMailShow ? "Hide CC email options" : "Show CC email options"
          }
          title={ccMailShow ? "Hide CC email options" : "Add CC recipients"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            ccMailShow
              ? "border-orange-200 bg-orange-50 text-[#F27B1E]"
              : "border-[#E3E7F0] bg-[#F7F9FC] text-[#64748B] hover:border-orange-200 hover:text-[#F27B1E]"
          }`}
        >
          <AtSign size={18} />
        </button>
      </div>

      {/* Create Reminder */}
      <div className="border-b border-[#EDF0F5] bg-[#FAFBFD] p-4 sm:px-5">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label
              htmlFor="reminder-description"
              className="mb-1.5 block text-xs font-semibold text-[#526078]"
            >
              Reminder description
            </label>

            <Input
              id="reminder-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What do you need to remember?"
              maxLength={500}
              className="h-10 border-[#E3E7F0] bg-white text-sm focus-visible:ring-[#0A2E66]"
            />
          </div>

          <div>
            <label
              htmlFor="reminder-date"
              className="mb-1.5 block text-xs font-semibold text-[#526078]"
            >
              Date and time
            </label>

            <div className="relative">
              <CalendarClock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A92A6]"
              />

              <Input
                id="reminder-date"
                type="datetime-local"
                value={reminderAt}
                onChange={(event) => setReminderAt(event.target.value)}
                className="h-10 border-[#E3E7F0] bg-white pl-9 text-sm focus-visible:ring-[#0A2E66]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={creating || !employeeId}
            className="h-10 w-full gap-2 rounded-xl bg-[#0A2E66] text-white shadow-sm transition-colors hover:bg-[#082653] disabled:opacity-60"
          >
            {creating ? (
              <span>Adding reminder...</span>
            ) : (
              <>
                <Plus size={16} />
                Add Reminder
              </>
            )}
          </Button>
        </form>

        {/* CC Email Selector */}
        {ccMailShow && (
          <div className="mt-4 rounded-xl border border-[#E3E7F0] bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26344D]">
                <Users size={16} className="text-[#F27B1E]" />
                CC recipients
              </div>

              <span className="rounded-full bg-[#FFF4E9] px-2 py-0.5 text-[11px] font-semibold text-[#C66513]">
                {selectEmail.length} selected
              </span>
            </div>

            {emailListLoading ? (
              <div className="space-y-2">
                <Skeleton height={28} count={2} borderRadius={8} />
              </div>
            ) : emailList.length > 0 ? (
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                {emailList.map((item) => {
                  const selected = selectEmail.some(
                    (email) => email?._id === item?._id,
                  );

                  return (
                    <button
                      key={item?._id}
                      type="button"
                      onClick={() => handleSelectEmail(item)}
                      title={item?.email}
                      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selected
                          ? "border-[#F27B1E]/40 bg-[#FFF4E9] text-[#A9510B]"
                          : "border-[#E3E7F0] bg-[#F8FAFD] text-[#526078] hover:border-[#F27B1E]/40"
                      }`}
                    >
                      {selected && <Check size={12} />}
                      <span className="truncate">
                        {item?.email || "Unknown email"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8A92A6]">
                No email recipients available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Reminder List */}
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#26344D]">Your reminders</h3>

          <span className="rounded-full bg-[#F0F3F8] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#0A2E66]">
            {reminders.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#E9EDF4] p-3"
              >
                <Skeleton height={16} width="75%" />
                <Skeleton height={12} width="55%" className="mt-2" />
              </div>
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex min-h-32 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3ED] bg-[#FAFBFD] px-4 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F3F8] text-[#0A2E66]">
              <Bell size={19} />
            </div>

            <p className="text-sm font-semibold text-[#26344D]">
              No reminders yet
            </p>

            <p className="mt-1 text-xs text-[#929BAD]">
              Add a reminder above to get started.
            </p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {reminders.map((item) => (
              <li
                key={item._id}
                className="rounded-xl border border-[#E9EDF4] bg-white p-3 transition-colors hover:border-[#D5DEEF] hover:bg-[#FAFBFD]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item.reminderSend
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-[#F27B1E]"
                    }`}
                  >
                    {item.reminderSend ? (
                      <Check size={17} />
                    ) : (
                      <Clock3 size={17} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-5 text-[#26344D]">
                      {item.description}
                    </p>

                    <div className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-[#929BAD]">
                      <Clock3 size={12} className="mt-0.5 shrink-0" />
                      <span>{formatReminderDate(item.reminderAt)}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      item.reminderSend
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-[#C66513]"
                    }`}
                  >
                    {item.reminderSend ? "Sent" : "Pending"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[#EDF0F5] px-4 py-3 text-[11px] text-[#929BAD] sm:px-5">
        <Mail size={13} />
        <span>
          {selectEmail.length > 0
            ? `${selectEmail.length} CC recipient${selectEmail.length > 1 ? "s" : ""} selected`
            : "Use @ to add CC recipients"}
        </span>
      </div>
    </div>
  );
};

export default EmployeeReminder;
