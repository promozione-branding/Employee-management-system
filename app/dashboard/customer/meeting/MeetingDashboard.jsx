"use client";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
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

const MeetingDashboard = () => {
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

  const handleCallSubmit = (e) => {
    e.preventDefault();
    console.log("Call Update:", callForm);
  };

  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    console.log("Meeting Update:", meetingForm);
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    console.log("General Update:", generalForm);
  };

  return (
    <div className="flex gap-10 ">
      <div className="w-1/3">
        <h2 className="font-bold text-2xl text-center mb-5">Call Update</h2>
        <form onSubmit={handleCallSubmit} className="flex flex-col gap-2">
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
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>

      <div className="w-1/3">
        <h2 className="font-bold text-2xl text-center mb-5">Meeting Update</h2>
        <form onSubmit={handleMeetingSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Label>Interested</Label>
            <Select
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
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>

      <div className="w-1/3">
        <h2 className="font-bold text-2xl text-center mb-5">General Update</h2>
        <form onSubmit={handleGeneralSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Label>Note</Label>
            <Textarea
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
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>
    </div>
  );
};

export default MeetingDashboard;
