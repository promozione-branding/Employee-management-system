"use client";
import { Label } from "@/components/ui/label";
import React from "react";
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
  return (
    <div className="flex gap-10 ">
      <div className="w-1/3">
      <h2 className="font-bold text-2xl text-center mb-5">Call Update</h2>
        <form action="" className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Label>Call Update</Label>
            <Select>
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
            <Textarea />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Reminder</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Meeting Date</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>

      <div className="w-1/3">
      <h2 className="font-bold text-2xl text-center mb-5">Meeting Update</h2>
        <form action="" className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Label>Interested</Label>
            <Select>
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
            <Textarea />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Reminder</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Meeting Date</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>

      <div className="w-1/3">
      <h2 className="font-bold text-2xl text-center mb-5">General Update</h2>
        <form action="" className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <Label>Note</Label>
            <Textarea />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Reminder</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Meeting Date</Label>
            <div className="grid gap-2 grid-cols-2">
              <Input type="time" />
              <Input type="date" />
            </div>
          </div>
          <Button className={"w-full"}>Update</Button>
        </form>
      </div>
    </div>
  );
};

export default MeetingDashboard;
