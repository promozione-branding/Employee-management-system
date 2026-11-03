// components/employee-dashboard/common/EmployeeCalendar.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CalendarDays, Plus, Palette, X } from "lucide-react";

import toast from "react-hot-toast";
import {
  createCalendarService,
  getCalendarService,
} from "@/service/employee-dashboard/calendar";
import { eventColors } from "@/config/employee/staticData";

const NAVY = "#0A2E66";
const ORANGE = "#F27B1E";

const EmployeeCalendar = ({ employeeId }) => {
  const [events, setEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const tooltipRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const getCalendarItem = async () => {
      if (!employeeId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await getCalendarService(employeeId);

        if (!cancelled && res.success) {
          const calendarItems = res.data?.calendar || [];

          setEvents(
            calendarItems.map((item) => ({
              ...item,
              start: item.date,
              backgroundColor: item.backgroundColor || NAVY,
              borderColor: item.backgroundColor || NAVY,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching calendar:", error);

        if (!cancelled) {
          toast.error("Failed to load calendar");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getCalendarItem();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setNewEventTitle("");
    setNewEventColor("");
    setIsDialogOpen(true);
  };

  const handleAddEvent = async (event) => {
    event.preventDefault();

    const title = newEventTitle.trim();

    if (!title || !selectedDate) {
      toast.error("Please enter an event title");
      return;
    }

    if (!employeeId) {
      toast.error("Employee information is unavailable");
      return;
    }

    const calendarItem = {
      title,
      date: selectedDate,
      backgroundColor: newEventColor || NAVY,
    };

    setSaving(true);

    try {
      const res = await createCalendarService({
        employeeId,
        calendar: calendarItem,
      });

      if (res.success) {
        setEvents((previousEvents) => [
          ...previousEvents,
          {
            ...calendarItem,
            start: calendarItem.date,
            borderColor: calendarItem.backgroundColor,
          },
        ]);

        toast.success(res.message || "Calendar event added");

        setNewEventTitle("");
        setNewEventColor("");
        setIsDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to add calendar event");
      }
    } catch (error) {
      console.error("Error adding calendar event:", error);

      toast.error(
        error?.response?.data?.message || "Failed to add calendar event",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  };

  const handleEventMouseEnter = (info) => {
    removeTooltip();

    const tooltip = document.createElement("div");

    // Use textContent rather than innerHTML for event titles.
    const title = document.createElement("strong");
    title.textContent = info.event.title;

    const date = document.createElement("div");
    date.textContent = info.event.start
      ? info.event.start.toLocaleDateString()
      : "";

    tooltip.appendChild(title);
    tooltip.appendChild(date);

    Object.assign(tooltip.style, {
      position: "fixed",
      background: info.event.backgroundColor || NAVY,
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "10px",
      fontSize: "12px",
      lineHeight: "1.6",
      pointerEvents: "none",
      zIndex: "9999",
      boxShadow: "0 8px 24px rgba(15,27,51,0.18)",
      maxWidth: "240px",
      overflowWrap: "anywhere",
    });

    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    const moveTooltip = (event) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${event.clientX + 12}px`;
        tooltipRef.current.style.top = `${event.clientY + 12}px`;
      }
    };

    info.el._calendarTooltipMove = moveTooltip;
    info.el.addEventListener("mousemove", moveTooltip);
  };

  const handleEventMouseLeave = (info) => {
    if (info.el._calendarTooltipMove) {
      info.el.removeEventListener("mousemove", info.el._calendarTooltipMove);

      delete info.el._calendarTooltipMove;
    }

    removeTooltip();
  };

  useEffect(() => {
    return () => removeTooltip();
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E7F0] bg-white p-4 shadow-[0_4px_20px_rgba(15,27,51,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(15,27,51,0.07)] sm:p-5">
      <style>{`
        .employee-calendar .fc {
          font-family: inherit;
          color: #26344D;
          font-size: 12px;
        }

        .employee-calendar .fc-toolbar {
          gap: 8px;
          flex-wrap: wrap;
        }

        .employee-calendar .fc-toolbar-title {
          color: #0F1B33;
          font-size: 16px;
          font-weight: 700;
        }

        .employee-calendar .fc-button-primary {
          background: #0A2E66;
          border-color: #0A2E66;
          border-radius: 7px;
          box-shadow: none;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          padding: 6px 9px;
        }

        .employee-calendar .fc-button-primary:hover,
        .employee-calendar .fc-button-primary:focus {
          background: #123D7D;
          border-color: #123D7D;
          box-shadow: none;
        }

        .employee-calendar .fc-button-primary:not(:disabled).fc-button-active,
        .employee-calendar .fc-button-primary:not(:disabled):active {
          background: #F27B1E;
          border-color: #F27B1E;
        }

        .employee-calendar .fc-today-button {
          background: #FFF3E8;
          border-color: #FCE0C7;
          color: #B85D12;
        }

        .employee-calendar .fc-today-button:hover {
          background: #FCE6D2;
          border-color: #FCE0C7;
          color: #994B0C;
        }

        .employee-calendar .fc-scrollgrid {
          border-color: #E9EDF4;
          border-radius: 10px;
          overflow: hidden;
        }

        .employee-calendar .fc-theme-standard td,
        .employee-calendar .fc-theme-standard th {
          border-color: #E9EDF4;
        }

        .employee-calendar .fc-col-header-cell {
          background: #F7F8FB;
          padding: 7px 0;
        }

        .employee-calendar .fc-col-header-cell-cushion {
          color: #596579;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
        }

        .employee-calendar .fc-daygrid-day-number {
          color: #596579;
          font-size: 11px;
          padding: 5px;
          text-decoration: none;
        }

        .employee-calendar .fc-day-today {
          background: #FFF8F1 !important;
        }

        .employee-calendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #F27B1E;
          font-weight: 800;
        }

        .employee-calendar .fc-daygrid-event {
          border-radius: 4px;
          border: none;
          padding: 2px 3px;
          font-size: 10px;
        }

        .employee-calendar .fc-event-title {
          font-weight: 600;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .employee-calendar .fc-timegrid-slot-label,
        .employee-calendar .fc-timegrid-axis-cushion {
          color: #8A92A6;
          font-size: 10px;
        }

        .employee-calendar .fc-highlight {
          background: rgba(242,123,30,0.12);
        }

        .employee-calendar .fc-daygrid-day-frame {
          min-height: 52px;
        }

        @media (max-width: 639px) {
          .employee-calendar .fc-toolbar-title {
            font-size: 14px;
          }

          .employee-calendar .fc-toolbar {
            justify-content: center;
          }

          .employee-calendar .fc-toolbar-chunk {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }

          .employee-calendar .fc-button-primary {
            padding: 5px 7px;
            font-size: 10px;
          }

          .employee-calendar .fc-daygrid-day-frame {
            min-height: 38px;
          }
        }
      `}</style>

      {/* Card header */}
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E66] text-white">
            <CalendarDays size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[#0F1B33]">
              My Calendar
            </h2>

            <p className="mt-0.5 text-xs text-[#8A92A6]">
              Manage your schedule
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            setSelectedDate(new Date().toLocaleDateString("en-CA"));
            setNewEventTitle("");
            setNewEventColor("");
            setIsDialogOpen(true);
          }}
          className="h-9 shrink-0 gap-1.5 rounded-lg bg-[#0A2E66] px-3 text-xs font-semibold text-white hover:bg-[#123D7D]"
        >
          <Plus size={15} />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Calendar */}
      <div className="employee-calendar min-w-0 flex-1">
        {loading ? (
          <div className="space-y-3">
            <div className="flex justify-between gap-3">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-[#F0F3F8]" />
              <div className="h-8 w-32 animate-pulse rounded-lg bg-[#F0F3F8]" />
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded-md bg-[#F0F3F8]"
                />
              ))}
            </div>
          </div>
        ) : (
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
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            dayMaxEvents={2}
            fixedWeekCount={false}
          />
        )}
      </div>

      {/* Add event dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#E3E7F0] bg-white p-0">
          <DialogHeader className="border-b border-[#EDF0F5] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2E66] text-white">
                <CalendarDays size={19} />
              </div>

              <div>
                <DialogTitle className="text-base font-bold text-[#0F1B33]">
                  Add Calendar Event
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs text-[#8A92A6]">
                  Add an event to your schedule.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddEvent} className="space-y-5 p-5">
            <div>
              <label
                htmlFor="employee-event-title"
                className="mb-2 block text-sm font-semibold text-[#26344D]"
              >
                Event title
              </label>

              <Input
                id="employee-event-title"
                value={newEventTitle}
                onChange={(event) => setNewEventTitle(event.target.value)}
                placeholder="e.g. Team meeting"
                maxLength={120}
                required
                className="h-10 rounded-lg border-[#E3E7F0] focus-visible:ring-[#0A2E66]"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Palette size={15} className="text-[#F27B1E]" />

                <label className="text-sm font-semibold text-[#26344D]">
                  Event color
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                {eventColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewEventColor(color)}
                    aria-label={`Choose ${color} event color`}
                    aria-pressed={newEventColor === color}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      newEventColor === color
                        ? "ring-2 ring-[#0A2E66] ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {newEventColor === color && (
                      <span className="h-2 w-2 rounded-full bg-white shadow" />
                    )}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-[#929BAD]">
                Default color is navy.
              </p>
            </div>

            {selectedDate && (
              <div className="rounded-lg border border-[#E3E7F0] bg-[#FAFBFD] px-3 py-2.5">
                <p className="text-xs text-[#8A92A6]">Event date</p>

                <p className="mt-1 text-sm font-semibold text-[#26344D]">
                  {selectedDate}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-[#EDF0F5] pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg border-[#E3E7F0]"
              >
                <X size={15} className="mr-1.5" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || !newEventTitle.trim()}
                className="rounded-lg bg-[#0A2E66] text-white hover:bg-[#123D7D]"
              >
                {saving ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeCalendar;
