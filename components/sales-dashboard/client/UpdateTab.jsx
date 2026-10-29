// components/sales-dashboard/client/UpdateTab.jsx

"use client";
import { getCallHistoryService } from "@/service/calling";
import CallPanel from "./CallPanel";
import CallHistory from "./CallHistory";
import { Label } from "@/components/ui/label";
import React, { useEffect, useMemo, useState } from "react";
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
  getCcRecipientsService,
} from "@/service/meeting";
import { useSalesEmployeeStore } from "@/lib/store/salesEmployeeStore";

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

const CcPicker = ({
  title,
  employees,
  selected,
  onToggle,
  search,
  setSearch,
}) => {
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((u) => {
      const name = (u?.name || "").toLowerCase();
      const email = (u?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [employees, search]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{title}</Label>
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-52 overflow-y-auto border rounded-lg divide-y bg-white">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            No match found
          </div>
        ) : (
          filtered.map((u) => {
            const isSelected = selected.some((s) => s?._id === u?._id);
            return (
              <label
                key={u?._id}
                className={`flex items-center gap-3 p-2 cursor-pointer text-sm ${
                  isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(u)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-gray-800 truncate">
                    {u?.name || "Unnamed"}
                    {u?.role ? (
                      <span className="ml-2 text-xs text-gray-500 capitalize">
                        ({u.role})
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {u?.email}
                  </span>
                </div>
              </label>
            );
          })
        )}
      </div>
      {selected.length > 0 && (
        <div className="text-xs text-gray-600">
          {selected.length} recipient{selected.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
};

const UpdateTab = ({ customerId, salesPersonId }) => {
  const [loading, setLoading] = useState(false);
  const [newMeeting, setNewMeeting] = useState(false);
  const [meetingUpdateId, setMeetingUpdateId] = useState("");
  const [loadingEmailList, setLoadingEmailList] = useState(true);
  const [emailListData, setEmailListData] = useState([]);

  const { employee } = useSalesEmployeeStore();

  // ---------- Meeting ----------
  const [meetingSearch, setMeetingSearch] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    status: "",
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });
  const [meetingRecipients, setMeetingRecipients] = useState([]);

  // ---------- Call ----------
  const [callForm, setCallForm] = useState({
    status: "",
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });
  const [callSendMail, setCallSendMail] = useState(false);
  const [callSearch, setCallSearch] = useState("");
  const [callRecipients, setCallRecipients] = useState([]);

  // ---------- General ----------
  const [generalForm, setGeneralForm] = useState({
    subject: "",
    note: "",
    reminderTime: "",
    reminderDate: "",
    meetingTime: "",
    meetingDate: "",
  });
  const [generalSendMail, setGeneralSendMail] = useState(false);
  const [generalSearch, setGeneralSearch] = useState("");
  const [generalRecipients, setGeneralRecipients] = useState([]);

  const [callHistory, setCallHistory] = useState([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);

  const fetchCallHistory = async () => {
    if (!customerId) return;
    try {
      setCallHistoryLoading(true);
      const res = await getCallHistoryService(customerId, "all");
      if (res?.success) {
        setCallHistory(res.data || []);
      }
    } catch (err) {
      console.log("fetchCallHistory error:", err);
    } finally {
      setCallHistoryLoading(false);
    }
  };

  const toggleRecipient = (setter) => (user) => {
    setter((prev) => {
      const exists = prev.some((s) => s?._id === user?._id);
      return exists ? prev.filter((s) => s._id !== user?._id) : [...prev, user];
    });
  };

  // ---------- CALL submit ----------
  const handleCallSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!employee?.user?._id) {
      toast.error("please provide sale person id");
      setLoading(false);
      return;
    }

    const formData = {
      salesPersonId: employee?.user?._id || "",
      salesPerson: callSendMail ? callRecipients.map((u) => u?._id) : [],
      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt: toLocalISO(callForm.meetingDate, callForm.meetingTime),
      reminderAt: toLocalISO(callForm.reminderDate, callForm.reminderTime),
      sendToSelf: callSendMail,
      ccAdmin: callSendMail, // 👈 AUTO-CC ADMIN when mail is on
      mailRecipients: callSendMail ? callRecipients.map((u) => u?._id) : [],
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }

    try {
      const res = await createMeetingService(formData);
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setCallRecipients([]);
        setCallSendMail(false);
        setCallSearch("");
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
      salesPersonId: employee?.user?._id || "",
      salesPerson: callSendMail ? callRecipients.map((u) => u?._id) : [],
      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt: toLocalISO(callForm.meetingDate, callForm.meetingTime),
      reminderAt: toLocalISO(callForm.reminderDate, callForm.reminderTime),
      sendToSelf: callSendMail,
      ccAdmin: callSendMail, // 👈 AUTO-CC ADMIN when mail is on
      mailRecipients: callSendMail ? callRecipients.map((u) => u?._id) : [],
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }
    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setCallRecipients([]);
          setCallSendMail(false);
          setCallSearch("");
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

  // ---------- MEETING submit ----------
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: employee?.user?._id || "",
      salesPerson: meetingRecipients.map((u) => u?._id),
      clientId: customerId,
      updateType: "meeting",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt: toLocalISO(meetingForm.meetingDate, meetingForm.meetingTime),
      reminderAt: toLocalISO(meetingForm.reminderDate, meetingForm.reminderTime),
      sendToSelf: true,
      ccAdmin: true, // always on for meeting
      mailRecipients: meetingRecipients.map((u) => u?._id),
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }
    try {
      const res = await createMeetingService(formData);
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setMeetingRecipients([]);
        setMeetingSearch("");
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
      salesPersonId: employee?.user?._id || "",
      salesPerson: meetingRecipients.map((u) => u?._id),
      clientId: customerId,
      updateType: "meeting",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt: toLocalISO(meetingForm.meetingDate, meetingForm.meetingTime),
      reminderAt: toLocalISO(meetingForm.reminderDate, meetingForm.reminderTime),
      sendToSelf: true,
      ccAdmin: true, // always on for meeting
      mailRecipients: meetingRecipients.map((u) => u?._id),
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }

    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setMeetingRecipients([]);
          setMeetingSearch("");
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

  // ---------- GENERAL submit ----------
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      salesPersonId: employee?.user?._id || "",
      salesPerson: generalSendMail ? generalRecipients.map((u) => u?._id) : [],
      clientId: customerId,
      updateType: "general",
      subject: generalForm?.subject || "",
      note: generalForm?.note,
      meetingAt: toLocalISO(generalForm.meetingDate, generalForm.meetingTime),
      reminderAt: toLocalISO(generalForm.reminderDate, generalForm.reminderTime),
      sendToSelf: generalSendMail,
      ccAdmin: generalSendMail, // 👈 AUTO-CC ADMIN when mail is on
      mailRecipients: generalSendMail
        ? generalRecipients.map((u) => u?._id)
        : [],
    };
    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }

    try {
      const res = await createMeetingService(formData);
      if (res.success) {
        toast.success(res.message || "Meet has been created");
        setLoading(false);
        setGeneralRecipients([]);
        setGeneralSendMail(false);
        setGeneralSearch("");
        setGeneralForm({
          subject: "",
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
      salesPersonId: employee?.user?._id || "",
      salesPerson: generalSendMail ? generalRecipients.map((u) => u?._id) : [],
      clientId: customerId,
      updateType: "general",
      subject: generalForm?.subject || "",
      note: generalForm?.note,
      meetingAt: toLocalISO(generalForm.meetingDate, generalForm.meetingTime),
      reminderAt: toLocalISO(generalForm.reminderDate, generalForm.reminderTime),
      sendToSelf: generalSendMail,
      ccAdmin: generalSendMail, // 👈 AUTO-CC ADMIN when mail is on
      mailRecipients: generalSendMail
        ? generalRecipients.map((u) => u?._id)
        : [],
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      setLoading(false);
      return;
    }
    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
          setGeneralRecipients([]);
          setGeneralSendMail(false);
          setGeneralSearch("");
          setGeneralForm({
            subject: "",
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
    async function loadCcRecipients() {
      try {
        const res = await getCcRecipientsService();
        if (res.success) {
          setEmailListData(res.data || []);
        } else {
          toast.error(res.message || "Failed to load recipients");
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message || "Failed to load recipients",
        );
      } finally {
        setLoadingEmailList(false);
      }
    }
    loadCcRecipients();
  }, []);

  useEffect(() => {
    fetchCallHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <div className="flex flex-col-reverse">
      <CallPanel
        customerId={customerId}
        customerName="Customer"
        customerPhone="—"
        virtualNumber={process.env.NEXT_PUBLIC_MYOP_VIRTUAL_NUMBER || "—"}
        onCallStarted={() => {
          setTimeout(fetchCallHistory, 2000);
        }}
      />

      <div className="mb-5">
        {callHistoryLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            Loading call history…
          </div>
        ) : (
          <CallHistory calls={callHistory} />
        )}
      </div>

      <div className="flex gap-10">
        {/* -------- CALL -------- */}
        <div className="w-1/3">
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
                  <SelectItem value="no-talk">APPOINTMENT</SelectItem>
                  
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

            <div className="flex flex-col gap-2 border rounded-lg p-3 bg-gray-50">
              <Label>Send mail?</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="callSendMail"
                    checked={!callSendMail}
                    onChange={() => setCallSendMail(false)}
                  />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="callSendMail"
                    checked={callSendMail}
                    onChange={() => setCallSendMail(true)}
                  />
                  Yes
                </label>
              </div>
              {callSendMail && (
                <CcPicker
                  title="Choose CC recipients (self + admin always CC'd)"
                  employees={emailListData}
                  selected={callRecipients}
                  onToggle={toggleRecipient(setCallRecipients)}
                  search={callSearch}
                  setSearch={setCallSearch}
                />
              )}
            </div>

            <Button className={"w-full"} disabled={loading}>
              Call Update
            </Button>
          </form>
        </div>

        {/* -------- MEETING -------- */}
        <div className="w-1/3">
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

            <div className="flex flex-col gap-2 border rounded-lg p-3 bg-blue-50/50">
              <div className="text-xs text-gray-700">
                Mail will be sent to you + <strong>admin</strong> (CC). Tick
                employees below to add them to CC.
              </div>
              <CcPicker
                title="CC employees (optional)"
                employees={emailListData}
                selected={meetingRecipients}
                onToggle={toggleRecipient(setMeetingRecipients)}
                search={meetingSearch}
                setSearch={setMeetingSearch}
              />
            </div>

            <Button className={"w-full"}>Meeting Update</Button>
          </form>
        </div>

        {/* -------- GENERAL -------- */}
        <div className="w-1/3">
          <h2 className="font-bold text-2xl text-center mb-5">
            General Update
          </h2>
          <form
            onSubmit={newMeeting ? handleGeneralSubmit : updateGeneralSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-3">
              <Label>Subject (optional)</Label>
              <Input
                placeholder="Leave blank to use default subject"
                value={generalForm.subject}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, subject: e.target.value })
                }
              />
            </div>
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

            <div className="flex flex-col gap-2 border rounded-lg p-3 bg-gray-50">
              <Label>Send mail?</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="generalSendMail"
                    checked={!generalSendMail}
                    onChange={() => setGeneralSendMail(false)}
                  />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="generalSendMail"
                    checked={generalSendMail}
                    onChange={() => setGeneralSendMail(true)}
                  />
                  Yes
                </label>
              </div>
              {generalSendMail && (
                <CcPicker
                  title="Choose CC recipients (self + admin always CC'd)"
                  employees={emailListData}
                  selected={generalRecipients}
                  onToggle={toggleRecipient(setGeneralRecipients)}
                  search={generalSearch}
                  setSearch={setGeneralSearch}
                />
              )}
            </div>

            <Button className={"w-full"}>generate Update</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTab;
