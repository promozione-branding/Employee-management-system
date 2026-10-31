
// components/admin-dashboard/dashboard/AdminCalendar.jsx

"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock3,
  Palette,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { eventColors } from "@/config/employee/staticData";
import { useAdminStore } from "@/lib/store/AdminStore";
import {
  createAdminCalenderService,
  getAdminCalenderService,
} from "@/service/admin-dashboard/dashboard-api";

const COLORS = {
  navy: "#0A2E66",
  navy2: "#12397A",
  navy3: "#061D44",
  blue: "#2B5086",
  blueLight: "#3B69AD",
  orange: "#F27B1E",
  orangeLight: "#F7A25C",
  cream: "#FFF5EB",
  background: "#F2F4F9",
  card: "#FFFFFF",
  card2: "#F7F8FC",
  ink: "#0F1B33",
  muted: "#5B6478",
  faint: "#8A92A6",
  line: "#E3E7F0",
  green: "#17845A",
  red: "#CC3B32",
};

const CALENDAR_STYLES = `
  .admin-calendar {
    --fc-border-color: #E3E7F0;
    --fc-page-bg-color: #FFFFFF;
    --fc-neutral-bg-color: #F7F8FC;
    --fc-today-bg-color: #FFF5EB;
    --fc-now-indicator-color: #F27B1E;
    color: #0F1B33;
    font-family: inherit;
  }

  .admin-calendar .fc-toolbar {
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 22px !important;
  }

  .admin-calendar .fc-toolbar-title {
    color: #0A2E66;
    font-size: clamp(17px, 2vw, 22px);
    font-weight: 900;
    letter-spacing: -0.03em;
  }

  .admin-calendar .fc-button {
    min-height: 36px;
    border: 1px solid #E3E7F0 !important;
    border-radius: 10px !important;
    background: #FFFFFF !important;
    color: #0A2E66 !important;
    box-shadow: none !important;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    padding: 7px 11px !important;
    transition: background-color .15s, border-color .15s, color .15s;
  }

  .admin-calendar .fc-button:hover {
    border-color: #F27B1E !important;
    background: #FFF5EB !important;
    color: #0A2E66 !important;
  }

  .admin-calendar .fc-button:focus {
    box-shadow: 0 0 0 3px rgba(242,123,30,.18) !important;
  }

  .admin-calendar .fc-button-primary:not(:disabled).fc-button-active,
  .admin-calendar .fc-button-primary:not(:disabled):active {
    border-color: #0A2E66 !important;
    background: #0A2E66 !important;
    color: #FFFFFF !important;
  }

  .admin-calendar .fc-today-button {
    border-color: #0A2E66 !important;
    background: #0A2E66 !important;
    color: #FFFFFF !important;
    box-shadow: inset 0 -2px 0 #F27B1E !important;
  }

  .admin-calendar .fc-today-button:hover {
    background: #12397A !important;
    color: #FFFFFF !important;
  }

  .admin-calendar .fc-col-header-cell {
    background: #F7F8FC;
  }

  .admin-calendar .fc-col-header-cell-cushion {
    padding: 11px 4px;
    color: #5B6478;
    font-size: 11px;
    font-weight: 900;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: .045em;
  }

  .admin-calendar .fc-daygrid-day-number {
    padding: 9px;
    color: #0F1B33;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
  }

  .admin-calendar .fc-day-today .fc-daygrid-day-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
    margin: 4px;
    border-radius: 9px;
    background: #F27B1E;
    color: #FFFFFF;
  }

  .admin-calendar .fc-daygrid-day,
  .admin-calendar .fc-timegrid-slot {
    transition: background-color .12s ease;
  }

  .admin-calendar .fc-daygrid-day:hover {
    background: #F7F8FC;
    cursor: pointer;
  }

  .admin-calendar .fc-daygrid-day-frame {
    min-height: 92px;
  }

  .admin-calendar .fc-event {
    border: 0 !important;
    border-radius: 6px;
    padding: 3px 5px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .admin-calendar .fc-event:hover {
    filter: brightness(.96);
  }

  .admin-calendar .fc-event-title,
  .admin-calendar .fc-event-time {
    font-weight: 700;
  }

  .admin-calendar .fc-timegrid-event {
    border-radius: 7px;
    padding: 3px;
  }

  .admin-calendar .fc-timegrid-slot-label,
  .admin-calendar .fc-timegrid-axis-cushion {
    color: #5B6478;
    font-size: 11px;
  }

  .admin-calendar .fc-scrollgrid {
    overflow: hidden;
    border: 1px solid #E3E7F0;
    border-radius: 13px;
  }

  .admin-calendar .fc-scrollgrid table {
    border-color: #E3E7F0;
  }

  .admin-calendar .fc-daygrid-more-link {
    color: #0A2E66;
    font-size: 11px;
    font-weight: 800;
  }

  .admin-calendar .fc-highlight {
    background: rgba(242,123,30,.13);
  }

  @media (max-width: 640px) {
    .admin-calendar .fc-toolbar {
      justify-content: center;
      margin-bottom: 15px !important;
    }

    .admin-calendar .fc-toolbar-chunk {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .admin-calendar .fc-toolbar-title {
      font-size: 16px;
    }

    .admin-calendar .fc-button {
      min-height: 32px;
      padding: 6px 8px !important;
      font-size: 11px;
    }

    .admin-calendar .fc-daygrid-day-frame {
      min-height: 58px;
    }

    .admin-calendar .fc-daygrid-day-number {
      padding: 5px;
      font-size: 11px;
    }

    .admin-calendar .fc-col-header-cell-cushion {
      padding: 8px 1px;
      font-size: 9px;
    }
  }
`;

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { adminDetail } = useAdminStore();
  const tooltipRef = useRef(null);
  const calendarWrapperRef = useRef(null);

  const removeTooltip = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  }, []);

  const getCalendarItem = useCallback(async () => {
    if (!adminDetail?._id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await getAdminCalenderService(adminDetail._id);

      if (res?.success) {
        const calendarItems = res?.data?.calendar || [];

        setEvents(
          calendarItems.map((item, index) => ({
            ...item,
            id: item._id || item.id || `${item.date}-${index}`,
            start: item.date || item.start,
            backgroundColor:
              item.backgroundColor || COLORS.navy,
            borderColor: item.backgroundColor || COLORS.navy,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      toast.error("Unable to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [adminDetail?._id]);

  useEffect(() => {
    getCalendarItem();

    return () => {
      removeTooltip();
    };
  }, [getCalendarItem, removeTooltip]);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setNewEventTitle("");
    setNewEventColor("");
    setIsDialogOpen(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!newEventTitle.trim() || !selectedDate) {
      toast.error("Enter an event title and select a date");
      return;
    }

    if (!adminDetail?._id) {
      toast.error("Unable to identify the current user");
      return;
    }

    const eventColor = newEventColor || COLORS.navy;

    const calendarItem = {
      title: newEventTitle.trim(),
      date: selectedDate,
      backgroundColor: eventColor,
    };

    try {
      setSaving(true);

      const res = await createAdminCalenderService({
        userId: adminDetail._id,
        calendar: [calendarItem],
      });

      if (res?.success) {
        // FullCalendar expects each event to be an object,
        // not an array containing an event object.
        const createdEvent = {
          ...calendarItem,
          start: calendarItem.date,
          backgroundColor: eventColor,
          borderColor: eventColor,
        };

        setEvents((prev) => [...prev, createdEvent]);

        toast.success(res.message || "Calendar event added");
        setNewEventTitle("");
        setNewEventColor("");
        setIsDialogOpen(false);
      } else {
        toast.error(res?.message || "Unable to save calendar event");
      }
    } catch (error) {
      console.error("Failed to create calendar event:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to save calendar event"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEventMouseEnter = (info) => {
    removeTooltip();

    const tooltip = document.createElement("div");
    tooltip.textContent = `${info.event.title} · ${
      info.event.start
        ? info.event.start.toLocaleDateString()
        : "Date unavailable"
    }`;

    Object.assign(tooltip.style, {
      position: "fixed",
      top: "0px",
      left: "0px",
      maxWidth: "min(300px, calc(100vw - 24px))",
      padding: "8px 11px",
      borderRadius: "10px",
      background: COLORS.navy3,
      color: "#FFFFFF",
      border: `1px solid ${COLORS.navy2}`,
      boxShadow: "0 8px 24px rgba(6,29,68,.2)",
      fontSize: "12px",
      fontWeight: "700",
      lineHeight: "1.5",
      pointerEvents: "none",
      zIndex: "9999",
      whiteSpace: "normal",
    });

    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    const moveTooltip = (event) => {
      if (!tooltipRef.current) return;

      const offset = 14;
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let left = event.clientX + offset;
      let top = event.clientY + offset;

      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = event.clientX - tooltipRect.width - offset;
      }

      if (top + tooltipRect.height > window.innerHeight - 8) {
        top = event.clientY - tooltipRect.height - offset;
      }

      tooltipRef.current.style.left = `${Math.max(8, left)}px`;
      tooltipRef.current.style.top = `${Math.max(8, top)}px`;
    };

    info.el.addEventListener("mousemove", moveTooltip);
    info.el._calendarTooltipMove = moveTooltip;
  };

  const handleEventMouseLeave = (info) => {
    if (info.el._calendarTooltipMove) {
      info.el.removeEventListener(
        "mousemove",
        info.el._calendarTooltipMove
      );
      delete info.el._calendarTooltipMove;
    }

    removeTooltip();
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);

    if (!open) {
      setNewEventTitle("");
      setNewEventColor("");
      setSelectedDate(null);
    }
  };

  return (
    <section className="min-w-0 space-y-4">
      <style>{CALENDAR_STYLES}</style>

      {/* Calendar heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: COLORS.cream,
              color: COLORS.orange,
            }}
          >
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h2
              className="text-lg font-black tracking-tight sm:text-xl"
              style={{ color: COLORS.navy }}
            >
              Calendar
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm"
              style={{ color: COLORS.muted }}
            >
              Manage events and important dates
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            setSelectedDate(
              new Date().toLocaleDateString("en-CA")
            );
            setNewEventTitle("");
            setNewEventColor("");
            setIsDialogOpen(true);
          }}
          className="h-10 rounded-xl px-4 font-bold text-white hover:brightness-110"
          style={{
            background: COLORS.navy,
            boxShadow: `inset 0 -3px 0 ${COLORS.orange}`,
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add event
        </Button>
      </div>

      {/* Calendar surface */}
      <div
        className="rounded-[20px] border p-3 shadow-sm sm:p-5 lg:p-6"
        style={{
          borderColor: COLORS.line,
          background: COLORS.card,
          boxShadow:
            "0 1px 2px rgba(10,46,102,.05), 0 8px 24px -12px rgba(10,46,102,.18)",
        }}
      >
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="h-8 w-36 animate-pulse rounded-lg"
                style={{ background: COLORS.card2 }}
              />
              <div className="flex gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-9 w-16 animate-pulse rounded-lg"
                    style={{ background: COLORS.card2 }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-12 animate-pulse rounded-lg sm:min-h-20"
                  style={{ background: COLORS.card2 }}
                />
              ))}
            </div>

            <p className="text-center text-xs" style={{ color: COLORS.muted }}>
              Loading calendar...
            </p>
          </div>
        ) : (
          <div ref={calendarWrapperRef} className="admin-calendar min-w-0">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
              events={events}
              height="auto"
              contentHeight="auto"
              expandRows
              dayMaxEvents={3}
              nowIndicator
              selectable={false}
              dateClick={handleDateClick}
              eventMouseEnter={handleEventMouseEnter}
              eventMouseLeave={handleEventMouseLeave}
              datesSet={removeTooltip}
            />
          </div>
        )}
      </div>

      {/* Add event dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          className="w-[calc(100%-24px)] max-w-md overflow-hidden rounded-2xl border p-0 sm:w-full"
          style={{
            borderColor: COLORS.line,
            background: COLORS.card,
            color: COLORS.ink,
          }}
        >
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.orange})`,
            }}
          />

          <div className="p-5 sm:p-6">
            <DialogHeader className="mb-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: COLORS.cream,
                  color: COLORS.orange,
                }}
              >
                <CalendarDays className="h-5 w-5" />
              </div>

              <DialogTitle
                className="text-xl font-black tracking-tight"
                style={{ color: COLORS.navy }}
              >
                Add new event
              </DialogTitle>

              <p className="text-sm" style={{ color: COLORS.muted }}>
                Create a calendar event for your selected date.
              </p>
            </DialogHeader>

            <form onSubmit={handleAddEvent} className="space-y-5">
              <div>
                <label
                  htmlFor="calendar-event-title"
                  className="mb-1.5 block text-xs font-bold"
                  style={{ color: COLORS.ink }}
                >
                  Event title
                </label>

                <Input
                  id="calendar-event-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Client follow-up"
                  required
                  maxLength={150}
                  className="h-11 rounded-xl border-[1.5px] bg-white shadow-none focus-visible:ring-2"
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.ink,
                  }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center gap-2 text-xs font-bold"
                  style={{ color: COLORS.ink }}
                >
                  <Clock3 className="h-3.5 w-3.5" style={{ color: COLORS.orange }} />
                  Event date
                </label>

                <div
                  className="flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  style={{
                    borderColor: COLORS.line,
                    background: COLORS.card2,
                    color: COLORS.muted,
                  }}
                >
                  <CalendarDays
                    className="h-4 w-4 shrink-0"
                    style={{ color: COLORS.orange }}
                  />
                  {selectedDate
                    ? new Date(
                        `${selectedDate}T00:00:00`
                      ).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Select a date"}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    className="flex items-center gap-2 text-xs font-bold"
                    style={{ color: COLORS.ink }}
                  >
                    <Palette
                      className="h-3.5 w-3.5"
                      style={{ color: COLORS.orange }}
                    />
                    Event color
                  </label>

                  <span className="text-[11px]" style={{ color: COLORS.muted }}>
                    Optional
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {eventColors.map((color) => {
                    const selected = newEventColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewEventColor(
                          selected ? "" : color
                        )}
                        aria-label={`Choose event color ${color}`}
                        aria-pressed={selected}
                        title={color}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{
                          background: color,
                          outline: selected
                            ? `3px solid ${COLORS.orange}`
                            : "2px solid transparent",
                          outlineOffset: selected ? "3px" : "0",
                          boxShadow: selected
                            ? "0 0 0 5px #FFF5EB"
                            : "0 1px 3px rgba(15,27,51,.12)",
                        }}
                      >
                        {selected && (
                          <span
                            className="text-sm font-black"
                            style={{
                              color: "#FFFFFF",
                              textShadow: "0 1px 2px rgba(0,0,0,.3)",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-[11px]" style={{ color: COLORS.muted }}>
                  {newEventColor || "Default color: Navy"}
                </p>
              </div>

              <div
                className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"
                style={{ borderColor: COLORS.line }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={saving}
                  className="h-10 rounded-xl border px-4 font-bold"
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.muted,
                    background: COLORS.card,
                  }}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-xl px-5 font-black text-white hover:brightness-110 disabled:opacity-60"
                  style={{
                    background: COLORS.navy,
                    boxShadow: `inset 0 -3px 0 ${COLORS.orange}`,
                  }}
                >
                  {saving ? "Saving..." : "Save event"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminCalendar;
