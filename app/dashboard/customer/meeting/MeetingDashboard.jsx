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
import toast from "react-hot-toast";
import {
  addNewMeetingUpdate,
  checkNewMeetService,
  createMeetingService,
} from "@/service/meeting";

const MeetingDashboard = ({ customerId, salesPersonId }) => {
  const [loading, setLoading] = useState(false);
  const [newMeeting, setNewMeeting] = useState(false);
  const [meetingUpdateId, setMeetingUpdateId] = useState("");

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
      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt:
        callForm.meetingDate && callForm.meetingTime
          ? `${callForm.meetingDate}T${callForm.meetingTime}`
          : undefined,
      reminderAt:
        callForm.reminderDate && callForm.reminderTime
          ? `${callForm.reminderDate}T${callForm.reminderTime}`
          : undefined,
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
      clientId: customerId,
      updateType: "call",
      status: callForm?.status,
      note: callForm?.note,
      meetingAt:
        callForm.meetingDate && callForm.meetingTime
          ? `${callForm.meetingDate}T${callForm.meetingTime}`
          : undefined,
      reminderAt:
        callForm.reminderDate && callForm.reminderTime
          ? `${callForm.reminderDate}T${callForm.reminderTime}`
          : undefined,
    };

    if (!formData?.salesPersonId || !formData?.clientId) {
      toast.error("client id and salesPersonId not found");
      return;
    }

    try {
      if (meetingUpdateId !== "") {
        const res = await addNewMeetingUpdate(meetingUpdateId, formData);
        console.log(res, "data");
        if (res.success) {
          toast.success(res.message || "Meet has been Updated");
          setLoading(false);
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
      clientId: customerId,
      updateType: "meeting",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt:
        meetingForm.meetingDate && meetingForm.meetingTime
          ? `${meetingForm.meetingDate}T${meetingForm.meetingTime}`
          : undefined,
      reminderAt:
        meetingForm.reminderDate && meetingForm.reminderTime
          ? `${meetingForm.reminderDate}T${meetingForm.reminderTime}`
          : undefined,
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
      clientId: customerId,
      updateType: "call",
      status: meetingForm?.status,
      note: meetingForm?.note,
      meetingAt:
        meetingForm.meetingDate && meetingForm.meetingTime
          ? `${meetingForm.meetingDate}T${meetingForm.meetingTime}`
          : undefined,
      reminderAt:
        meetingForm.reminderDate && meetingForm.reminderTime
          ? `${meetingForm.reminderDate}T${meetingForm.reminderTime}`
          : undefined,
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
      clientId: customerId,
      updateType: "general",
      note: generalForm?.note,
      meetingAt:
        generalForm.meetingDate && generalForm.meetingTime
          ? `${generalForm.meetingDate}T${generalForm.meetingTime}`
          : undefined,
      reminderAt:
        generalForm.reminderDate && generalForm.reminderTime
          ? `${generalForm.reminderDate}T${generalForm.reminderTime}`
          : undefined,
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
      clientId: customerId,
      updateType: "general",
      note: generalForm?.note,
      meetingAt:
        generalForm.meetingDate && generalForm.meetingTime
          ? `${generalForm.meetingDate}T${generalForm.meetingTime}`
          : undefined,
      reminderAt:
        generalForm.reminderDate && generalForm.reminderTime
          ? `${generalForm.reminderDate}T${generalForm.reminderTime}`
          : undefined,
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

  return (
    <div className="flex gap-10 ">
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
              <Input
                type="time"
                value={callForm.reminderTime}
                onChange={(e) =>
                  setCallForm({ ...callForm, reminderTime: e.target.value })
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
              <Input
                type="time"
                value={callForm.meetingTime}
                onChange={(e) =>
                  setCallForm({ ...callForm, meetingTime: e.target.value })
                }
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

      <div className="w-1/3">
        <h2 className="font-bold text-2xl text-center mb-5">Meeting Update</h2>
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
              <Input
                type="time"
                value={meetingForm.reminderTime}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    reminderTime: e.target.value,
                  })
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
              <Input
                type="time"
                value={meetingForm.meetingTime}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    meetingTime: e.target.value,
                  })
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

      <div className="w-1/3">
        <h2 className="font-bold text-2xl text-center mb-5">General Update</h2>
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
              <Input
                type="time"
                value={generalForm.reminderTime}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    reminderTime: e.target.value,
                  })
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
              <Input
                type="time"
                value={generalForm.meetingTime}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    meetingTime: e.target.value,
                  })
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
  );
};

export default MeetingDashboard;
