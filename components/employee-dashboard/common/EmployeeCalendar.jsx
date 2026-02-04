"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  createCalendarService,
  getCalendarService,
} from "@/service/employee-dashboard/calendar";
import { eventColors } from "@/config/employee/staticData";

const EmployeeCalendar = ({ employeeId }) => {
  const [events, setEvents] = useState([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsDialogOpen(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEventTitle) {
      const newEvent = {
        title: newEventTitle,
        start: selectedDate,
        backgroundColor: newEventColor || "#3b82f6",
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      setNewEventTitle("");
      setNewEventColor("");
      setIsDialogOpen(false);

      const formData = {
        employeeId: employeeId,
        calendar: updatedEvents,
      };

     
      try {
        const res = await createCalendarService(formData);

        if (res.success) {
          toast.success(res.message || "Calendar event added");
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message ||
            "Error while create the event on calendar",
        );
      }
    }
  };

  async function getCalendarItem() {
    try {
      const res = await getCalendarService(employeeId);
      if (res.success) {
        const events = res.data.calendar.map((item) => ({
          ...item,
          start: item.date,
        }));
        setEvents(events);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error while get calendar items",
      );
    }
  }


  useEffect(() => {
    getCalendarItem();
  }, [employeeId]);

  return (
    <div className="flex gap-2 items-start ">
      <div className="mb-8 w-full  border rounded-lg">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              height="auto"
              contentHeight="auto"
              dateClick={handleDateClick}
            />
          </div>
        </div>
      </div>
      <div className="lg:w-1/2"></div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Event Title
              </label>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Flag</label>
              <div className="flex gap-2 flex-wrap">
                {eventColors.map((color) => (
                  <div
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    className={`h-8 w-8 rounded-full cursor-pointer ${
                      newEventColor === color
                        ? "ring-2 ring-offset-2 ring-black"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeCalendar;
