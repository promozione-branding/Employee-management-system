// app/dashboard/customer/meeting/MeetingDashboard.jsx

"use client";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TimePicker from "@/components/ui/time-picker";
import toast from "react-hot-toast";
import {
  addNewMeetingUpdate,
  checkNewMeetService,
  createMeetingService,
} from "@/service/meeting";
import { SalesPeopleMeetingService } from "@/service/customer";

// Convert local date + "HH:mm" -> ISO string with browser tz offset.
// Keeps DB instant correct (fixes "5:05 shows as 11:56" issues).
const toLocalISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return undefined;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return undefined;
  const local = new Date(y, mo - 1, d, h, mi, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const off = -local.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  const offsetStr = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(
    local.getDate(),
  )}T${pad(local.getHours())}:${pad(local.getMinutes())}:00${offsetStr}`;
};

const MeetingDashboard = ({ customerId, salesPersonId }) => {
  const [loading, setLoading] = useState(false);
  const [newMeeting, setNewMeeting] = useState(false);
  const [meetingUpdateId, setMeetingUpdateId] = useState("");
  const [loadingEmailList, setLoadingEmailList] = useState(true);
  const [emailListData, setEmailListData] = useState([]);
  const [selectEmail, setSelectEmail] = useState([]);

  const [callForm, setCallForm] = useState({
    status: "",
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });

  const [meetingForm, setMeetingForm] = useState({
    status: "",
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });

  const [generalForm, setGeneralForm] = useState({
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });

  // -------------------for Call update --------------------
  const handleCallSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),

      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt: toLocalISO(callForm.meetingDate, callForm.meetingTime),
      reminderAt: toLocalISO(callForm.reminderDate, callForm.reminderTime),
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }

    try {
      const res = await createMeetingService(formData);
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setSelectEmail([]);
        setCallForm({
          status: "",
          note: "",
          reminderTime: "",
          reminderDate: "",
          meetingTime: "",
          meetingDate: "",
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while create meeting");
    }
  };

  const updateCallSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),

      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt: toLocalISO(callForm.meetingDate, callForm.meetingTime),
      reminderAt: toLocalISO(callForm.reminderDate, callForm.reminderTime),
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }
    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setSelectEmail([]);
          setCallForm({
            status: "",
            note: "",
            reminderTime: "",
            reminderDate: "",
            meetingTime: "",
            meetingDate: "",
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while Updating meeting");
    }
  };

  // -------------------for Call update --------------------

  // ------------------Meeting update----------------

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),
      clientId: customerId,
      updateType: "meeting",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt: toLocalISO(meetingForm.meetingDate, meetingForm.meetingTime),
      reminderAt: toLocalISO(meetingForm.reminderDate, meetingForm.reminderTime),
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }
    try {
      const res = await createMeetingService(formData);
      console.log(res, "data");
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setSelectEmail([]);
        setMeetingForm({
          status: "",
          note: "",
          reminderTime: "",
          reminderDate: "",
          meetingTime: "",
          meetingDate: "",
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while create meeting");
    }
  };

  const updateMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),

      clientId: customerId,
      updateType: "meeting",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt: toLocalISO(meetingForm.meetingDate, meetingForm.meetingTime),
      reminderAt: toLocalISO(meetingForm.reminderDate, meetingForm.reminderTime),
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }

    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setSelectEmail([]);
          setMeetingForm({
            status: "",
            note: "",
            reminderTime: "",
            reminderDate: "",
            meetingTime: "",
            meetingDate: "",
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while Updating meeting");
    }
  };

  // ------------------Meeting update----------------

  // ------------------General update----------------
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),

      clientId: customerId,
      updateType: "general",
      note: generalForm?.note,
      meetingAt: toLocalISO(generalForm.meetingDate, generalForm.meetingTime),
      reminderAt: toLocalISO(generalForm.reminderDate, generalForm.reminderTime),
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }

    try {
      const res = await createMeetingService(formData);
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setSelectEmail([]);
        setGeneralForm({
          note: "",
          reminderTime: "",
          reminderDate: "",
          meetingTime: "",
          meetingDate: "",
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while create meeting");
    }
  };

  const updateGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: salesPersonId || "",
      salesPerson: selectEmail.map((item) => item?._id),

      clientId: customerId,
      updateType: "general",
      note: generalForm?.note,
      meetingAt: toLocalISO(generalForm.meetingDate, generalForm.meetingTime),
      reminderAt: toLocalISO(generalForm.reminderDate, generalForm.reminderTime),
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }
    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setSelectEmail([]);
          setGeneralForm({
            note: "",
            reminderTime: "",
            reminderDate: "",
            meetingTime: "",
            meetingDate: "",
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.message || "Error while Updating meeting");
    }
  };

  // ------------------General update----------------

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

  useEffect(() => {
    async function CheckNewMeet() {
      try {
        const res = await checkNewMeetService(customerId);
        if (res.success) {
          setNewMeeting(res?.newMeeting);
          setMeetingUpdateId(res.data?.meetingUpdate?._id);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message || "error while checking the new meeting");
      }
    }
    CheckNewMeet();
  }, [customerId]);

  useEffect(() => {
    async function salesPeopleMail() {
      try {
        const res = await SalesPeopleMeetingService();
        if (res.success) {
          setEmailListData(res.data);
          setLoadingEmailList(false);
        }
      } catch (error) {
        console.log(error);
        setLoadingEmailList(true);
        toast.error(
          error.response.date.message ||
            "Error while fetching the sales person",
        );
      }
    }
    salesPeopleMail();
  }, [customerId]);

  return (
    <div className="flex flex-col-reverse">
      <div>
        {loadingEmailList ? (
          <div className="border-dashed border-2 text-gray-500 text-center p-5 rounded-2xl mt-5">
            There is no email found
          </div>
        ) : (
          <div className="flex gap-4 my-3 flex-wrap">
            {emailListData.map((item) => {
              return (
                <button
                  onClick={() => handleSelectEmail(item)}
                  key={item?._id}
                  className={`p-2 border rounded-lg shadow-sm text-sm font-medium text-gray-700 duration-300 capitalize ${
                    selectEmail.some((s) => s?._id === item?._id)
                      ? "bg-blue-50 border-emerald-500 scale-105"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  @{item?.email?.split("@")[0]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="w-full">
          <h2 className="font-bold text-2xl text-center mb-5">Call Update</h2>
          <form
            onSubmit={newMeeting ? handleCallSubmit : updateCallSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-3">
              <Label>Call Update</Label>
              <Select
                value={callForm.status}
                onValueChange={(value) =>
                  setCallForm({ ...callForm, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Talk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="talk">Talk</SelectItem>
                  <SelectItem value="no-talk">No Talk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Note</Label>
              <Textarea
                value={callForm.note}
                onChange={(e) =>
                  setCallForm({ ...callForm, note: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Reminder</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={callForm.reminderTime}
                  onChange={(v) =>
                    setCallForm({ ...callForm, reminderTime: v })
                  }
                />
                <Input
                  type="date"
                  value={callForm.reminderDate}
                  onChange={(e) =>
                    setCallForm({ ...callForm, reminderDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Meeting Date</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={callForm.meetingTime}
                  onChange={(v) => setCallForm({ ...callForm, meetingTime: v })}
                />
                <Input
                  type="date"
                  value={callForm.meetingDate}
                  onChange={(e) =>
                    setCallForm({ ...callForm, meetingDate: e.target.value })
                  }
                />
              </div>
            </div>

            <Button className={"w-full"} disabled={loading}>
              Call Update
            </Button>
          </form>
        </div>

        <div className="w-full">
          <h2 className="font-bold text-2xl text-center mb-5">
            Meeting Update
          </h2>
          <form
            onSubmit={newMeeting ? handleMeetingSubmit : updateMeetingSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-3">
              <Label>Interested</Label>
              <Select
                required
                value={meetingForm.status}
                onValueChange={(value) =>
                  setMeetingForm({ ...meetingForm, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Client Interested" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not-interested">Not-Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Note</Label>
              <Textarea
                required
                value={meetingForm.note}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, note: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Reminder</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={meetingForm.reminderTime}
                  onChange={(v) =>
                    setMeetingForm({ ...meetingForm, reminderTime: v })
                  }
                />
                <Input
                  type="date"
                  value={meetingForm.reminderDate}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      reminderDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Meeting Date</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={meetingForm.meetingTime}
                  onChange={(v) =>
                    setMeetingForm({ ...meetingForm, meetingTime: v })
                  }
                />
                <Input
                  type="date"
                  value={meetingForm.meetingDate}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      meetingDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button className={"w-full"}>Meeting Update</Button>
          </form>
        </div>

        <div className="w-full">
          <h2 className="font-bold text-2xl text-center mb-5">
            General Update
          </h2>
          <form
            onSubmit={newMeeting ? handleGeneralSubmit : updateGeneralSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-3">
              <Label>Note</Label>
              <Textarea
                required
                value={generalForm.note}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, note: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Reminder</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={generalForm.reminderTime}
                  onChange={(v) =>
                    setGeneralForm({ ...generalForm, reminderTime: v })
                  }
                />
                <Input
                  type="date"
                  value={generalForm.reminderDate}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      reminderDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Meeting Date</Label>
              <div className="grid gap-2 grid-cols-2">
                <TimePicker
                  value={generalForm.meetingTime}
                  onChange={(v) =>
                    setGeneralForm({ ...generalForm, meetingTime: v })
                  }
                />
                <Input
                  type="date"
                  value={generalForm.meetingDate}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      meetingDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button className={"w-full"}>generate Update</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingDashboard;