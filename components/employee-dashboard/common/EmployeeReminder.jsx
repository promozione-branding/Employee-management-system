"use client";

import React, { useEffect, useState } from "react";
import {
  getReminderService,
  createReminderService,
} from "@/service/employee-dashboard/reminder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign, Bell } from "lucide-react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { getAllEmailService } from "@/service/team-update";

const EmployeeReminder = ({ employeeId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [emailListLoading, setEmailListLoading] = useState(true);
  const [selectEmail, setSelectEmail] = useState([]);

  const [ccMailShow, setCcMailShow] = useState(false);

  /* ================= FETCH ================= */
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await getReminderService(employeeId);
      setReminders(res?.data?.reminder || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      if (!description || !reminderAt) {
        return toast.error("Fill all fields");
      }

      const localDate = new Date(reminderAt);

      const res = await createReminderService({
        employeeId,
        description,
        reminderAt: localDate,
        cc_email: selectEmail.map((item) => item?.email),
      });

      if (res?.success) {
        toast.success(res.message || "Reminder created");
        setDescription("");
        setReminderAt("");
        setSelectEmail([]);
        fetchReminders();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error while creating reminder",
      );
    }
  };

  async function fetchEmail() {
    try {
      setEmailListLoading(true);
      const res = await getAllEmailService();
      if (res.success) {
        setEmailList(res.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setEmailListLoading(false);
    }
  }

  const handleSelectEmail = (email) => {
    setSelectEmail((prevEmail) => {
      const isSelected = prevEmail.some((s) => s?._id === email?._id);

      if (isSelected) {
        return prevEmail.filter((s) => s._id !== email?._id);
      } else {
        return [...prevEmail, email];
      }
    });
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (employeeId) fetchReminders();
    fetchEmail();
  }, [employeeId]);

  return (
    <div className="bg-[#f3eaea] rounded-lg shadow-md p-6 h-[70vh] lg:h-[68vh] lg:w-1/2 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-600" />
          <h2 className="text-xl font-bold">Reminders</h2>
        </div>
        <div
          onClick={() => setCcMailShow((prev) => !prev)}
          className={ccMailShow ? "text-orange-500" : "text-black"}
        >
          <AtSign />
        </div>
      </div>

      {/* Create Reminder */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Input
          placeholder="Reminder description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          type="datetime-local"
          value={reminderAt}
          onChange={(e) => setReminderAt(e.target.value)}
        />

        <Button onClick={handleCreate}>Add</Button>
      </div>

      {ccMailShow && (
        <div className="flex flex-wrap gap-3">
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

      {/* List */}
      {loading ? (
        <ul className="space-y-3 lg:h-[40vh] overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="p-3 border rounded-lg">
              <Skeleton height={20} width="70%" />
              <Skeleton height={14} width="40%" className="mt-2" />
            </li>
          ))}
        </ul>
      ) : reminders.length === 0 ? (
        <p className="text-sm text-slate-500">No reminders added</p>
      ) : (
        <ul
          className={`space-y-3 ${ccMailShow ? "lg:h-[20vh]" : "lg:h-[40vh] "} overflow-y-auto overflow-hidden duration-300 h-[30vh]`}
        >
          {reminders.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{item.description}</p>

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
  );
};

export default EmployeeReminder;
