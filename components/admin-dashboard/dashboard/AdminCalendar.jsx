
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

import toast from "react-hot-toast";

import { eventColors } from "@/config/employee/staticData";
import { useAdminStore } from "@/lib/store/AdminStore";

import {
  createAdminCalenderService,
  getAdminCalenderService,
} from "@/service/admin-dashboard/dashboard-api";

// ========================================
// COLORS
// ========================================

const COLORS = {
  navy: "#0A2E66",
  navy2: "#12397A",
  orange: "#F27B1E",

  purple: "#7050E8",
  purpleLight: "#EDE9FC",

  background: "#F2F4F9",
  white: "#FFFFFF",

  ink: "#0F1B33",
  muted: "#56647D",
  faint: "#8A95AC",

  line: "#E1E7F0",
  soft: "#F7F8FC",

  green: "#16865D",
};

// ========================================
// DATE HELPERS
// ========================================

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const addDays = (dateKey, amount) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
};

const getMonthDays = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const formatMonth = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatAgendaDate = (dateKey) => {
  return parseDateKey(dateKey).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// ========================================
// MAIN COMPONENT
// ========================================

const AdminCalendar = () => {
  const today = getLocalDateKey(new Date());

  const [events, setEvents] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const [agendaRange, setAgendaRange] = useState("day");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { adminDetail } = useAdminStore();

  // ========================================
  // FETCH EVENTS
  // ========================================

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
            date: item.date || item.start,
            backgroundColor: item.backgroundColor || COLORS.navy,
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
  }, [getCalendarItem]);

  // ========================================
  // CALENDAR NAVIGATION
  // ========================================

  const changeMonth = (direction) => {
    setCurrentMonth((previous) => {
      const next = new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1
      );

      const maxDay = getMonthDays(
        next.getFullYear(),
        next.getMonth()
      );

      const selectedDay = Math.min(
        parseDateKey(selectedDate).getDate(),
        maxDay
      );

      const nextSelectedDate = getLocalDateKey(
        new Date(
          next.getFullYear(),
          next.getMonth(),
          selectedDay
        )
      );

      setSelectedDate(nextSelectedDate);

      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();

    setCurrentMonth(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    setSelectedDate(getLocalDateKey(now));
  };

  // ========================================
  // OPEN EVENT DIALOG
  // ========================================

  const openEventDialog = (date = selectedDate) => {
    setSelectedDate(date);
    setNewEventTitle("");
    setNewEventColor("");
    setIsDialogOpen(true);
  };

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    openEventDialog(dateKey);
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);

    if (!open) {
      setNewEventTitle("");
      setNewEventColor("");
    }
  };

  // ========================================
  // CREATE EVENT
  // ========================================

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
        const createdEvent = {
          ...calendarItem,
          start: calendarItem.date,
          id: `event-${Date.now()}`,
        };

        setEvents((previous) => [
          ...previous,
          createdEvent,
        ]);

        toast.success(res.message || "Calendar event added");

        setNewEventTitle("");
        setNewEventColor("");
        setIsDialogOpen(false);
      } else {
        toast.error(
          res?.message || "Unable to save calendar event"
        );
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

  // ========================================
  // CALENDAR GRID
  // ========================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = getMonthDays(year, month);

    const totalCells =
      Math.ceil((firstDay + totalDays) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDay + 1;

      const date = new Date(year, month, dayNumber);

      return {
        dateKey: getLocalDateKey(date),
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
      };
    });
  }, [currentMonth]);

  // ========================================
  // AGENDA EVENTS
  // ========================================

  const agendaDates = useMemo(() => {
    const numberOfDays = agendaRange === "day" ? 1 : 3;

    return Array.from(
      { length: numberOfDays },
      (_, index) => addDays(selectedDate, index)
    );
  }, [selectedDate, agendaRange]);

  const agendaEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventDate = String(
          event.date || event.start || ""
        ).slice(0, 10);

        return agendaDates.includes(eventDate);
      })
      .sort((a, b) => {
        const dateA = String(a.date || a.start || "");
        const dateB = String(b.date || b.start || "");

        return dateA.localeCompare(dateB);
      });
  }, [events, agendaDates]);

  const hasEventsOnDate = (dateKey) => {
    return events.some(
      (event) =>
        String(event.date || event.start || "").slice(0, 10) === dateKey
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <section className="
        w-full max-w-[490px]
        rounded-[22px]
        border border-[#E1E7F0]
        bg-white p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
      ">
        <div className="mb-7 flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#EDE9FC]" />

          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-[#F2F4F9]" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#F2F4F9]" />
          </div>
        </div>

        <div className="mb-5 h-8 w-40 animate-pulse rounded bg-[#F2F4F9]" />

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="h-[48px] animate-pulse rounded-xl bg-[#F7F8FC]"
            />
          ))}
        </div>

        <div className="mt-6 h-24 animate-pulse rounded-xl bg-[#F7F8FC]" />
      </section>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      <section className="
        w-full 
        overflow-hidden
        rounded-[22px]
        border border-[#E1E7F0]
        bg-white
        p-5
        shadow-[0_3px_12px_rgba(10,46,102,0.05)]
        transition-shadow duration-300
        hover:shadow-[0_8px_24px_rgba(10,46,102,0.07)]
        sm:p-[22px]
      ">

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div className="mb-[18px] flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-[#EDE9FC]
              text-[#7050E8]
            ">
              <CalendarDays size={21} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">

              <h2 className="
                font-serif
                text-[21px]
                font-bold
                leading-tight
                tracking-tight
                text-[#0A2E66]
              ">
                Schedule
              </h2>

              <p className="mt-1 text-[13px] text-[#56647D]">
                Meetings and reminders
              </p>

            </div>
          </div>

          {/* Add meeting */}
          <button
            type="button"
            onClick={() => openEventDialog()}
            className="
              inline-flex h-[34px]
              shrink-0 items-center
              justify-center gap-2
              rounded-[11px]
              border-b-[3px]
              border-[#F27B1E]
              bg-[#0A2E66]
              px-3
              text-[13px]
              font-bold
              text-white
              transition-all duration-200
              hover:bg-[#12397A]
              active:scale-[0.97]
            "
          >
            <Plus size={15} strokeWidth={2.5} />
            Meeting
          </button>

        </div>

        {/* ================================== */}
        {/* MONTH NAVIGATION */}
        {/* ================================== */}

        <div className="mb-3 flex items-center justify-between gap-2">

          <h3 className="
            font-serif
            text-[18px]
            font-bold
            tracking-tight
            text-[#0A2E66]
          ">
            {formatMonth(currentMonth)}
          </h3>

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="
                flex h-[34px] w-[34px]
                items-center justify-center
                rounded-[12px]
                border border-[#E1E7F0]
                bg-white
                text-[#0F1B33]
                transition-colors
                hover:bg-[#F2F4F9]
                hover:border-[#C8D6EA]
              "
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="
                h-[34px]
                rounded-[12px]
                border border-[#E1E7F0]
                bg-white
                px-3
                text-[12px]
                font-medium
                text-[#34445F]
                transition-colors
                hover:bg-[#F2F4F9]
              "
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="
                flex h-[34px] w-[34px]
                items-center justify-center
                rounded-[12px]
                border border-[#E1E7F0]
                bg-white
                text-[#0F1B33]
                transition-colors
                hover:bg-[#F2F4F9]
                hover:border-[#C8D6EA]
              "
            >
              <ChevronRight size={19} />
            </button>

          </div>
        </div>

        {/* ================================== */}
        {/* CALENDAR GRID */}
        {/* ================================== */}

        <div className="w-full">

          {/* Weekdays */}
          <div className="mb-2 grid grid-cols-7">

            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="
                    flex h-[35px]
                    items-center justify-center
                    text-[11px]
                    font-semibold
                    text-[#8A95AC]
                  "
                >
                  {day}
                </div>
              )
            )}

          </div>

          {/* Dates */}
          <div className="grid grid-cols-7">

            {calendarDays.map((item) => {

              const isSelected = item.dateKey === selectedDate;
              const isToday = item.dateKey === today;
              const hasEvent = hasEventsOnDate(item.dateKey);

              return (

                <button
                  key={item.dateKey}
                  type="button"
                  onClick={() => handleDateClick(item.dateKey)}
                  aria-label={`Select ${item.dateKey}`}
                  aria-pressed={isSelected}
                  className={`
                    relative
                    mx-auto
                    my-[2px]
                    flex
                    h-[60px]
                    w-full
                    max-w-[60px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[12px]
                    text-[14px]
                    transition-all duration-150
                    active:scale-95

                    ${
                      isSelected
                        ? "bg-[#0A2E66] font-bold text-white shadow-sm"
                        : item.isCurrentMonth
                          ? "font-semibold text-[#0F1B33] hover:bg-[#F2F4F9]"
                          : "font-medium text-[#C2CAD8] hover:bg-[#F7F8FC]"
                    }
                  `}
                >

                  <span>{item.day}</span>

                  {/* Event indicator */}
                  {hasEvent && (
                    <span
                      className={`
                        absolute bottom-[7px]
                        h-[4px] w-[4px]
                        rounded-full
                        ${
                          isSelected
                            ? "bg-[#F7A25C]"
                            : "bg-[#F27B1E]"
                        }
                      `}
                    />
                  )}

                  {/* Today's indicator when not selected */}
                  {isToday && !isSelected && (
                    <span className="
                      absolute bottom-[5px]
                      h-[3px] w-[3px]
                      rounded-full bg-[#F27B1E]
                    " />
                  )}

                </button>

              );
            })}

          </div>
        </div>

        {/* ================================== */}
        {/* AGENDA SECTION */}
        {/* ================================== */}

        <div className="
          mt-4
          border-t border-dashed
          border-[#DDE4EF]
          pt-3
        ">

          {/* Agenda header */}
          <div className="mb-5 flex items-center justify-between gap-2">

            <h3 className="
              text-[14px]
              font-semibold
              text-[#0A2E66]
            ">
              {selectedDate === today
                ? "Today"
                : formatAgendaDate(selectedDate)}
            </h3>

            {/* Day / Next 3 days */}
            <div className="flex items-center gap-1.5">

              <button
                type="button"
                onClick={() => setAgendaRange("day")}
                className={`
                  h-[33px]
                  rounded-full
                  border
                  px-3.5
                  text-[12px]
                  font-semibold
                  transition-all duration-200
                  ${
                    agendaRange === "day"
                      ? "border-[#0A2E66] bg-[#0A2E66] text-white"
                      : "border-[#E1E7F0] bg-white text-[#56647D] hover:bg-[#F7F8FC]"
                  }
                `}
              >
                Day
              </button>

              <button
                type="button"
                onClick={() => setAgendaRange("three")}
                className={`
                  h-[33px]
                  rounded-full
                  border
                  px-3.5
                  text-[12px]
                  font-medium
                  whitespace-nowrap
                  transition-all duration-200
                  ${
                    agendaRange === "three"
                      ? "border-[#0A2E66] bg-[#0A2E66] text-white"
                      : "border-[#E1E7F0] bg-white text-[#56647D] hover:bg-[#F7F8FC]"
                  }
                `}
              >
                Next 3 days
              </button>

            </div>
          </div>

          {/* Agenda content */}
          {agendaEvents.length === 0 ? (

            <div className="
              flex min-h-[165px]
              flex-col items-center
              justify-center
              px-2
              pb-1
              text-center
            ">

              <Calendar
                size={39}
                strokeWidth={1.6}
                className="mb-3 text-[#8A95AC]"
              />

              <p className="
                text-[13px]
                leading-5
                text-[#64748B]
              ">
                Nothing planned. A great time to call back missed leads.
              </p>

              <button
                type="button"
                onClick={() => openEventDialog()}
                className="
                  mt-2
                  inline-flex h-[35px]
                  items-center justify-center
                  gap-1.5
                  rounded-[11px]
                  border border-[#E1E7F0]
                  bg-[#F7F8FC]
                  px-3
                  text-[12px]
                  font-bold
                  text-[#0A2E66]
                  transition-all duration-200
                  hover:border-[#C8D6EA]
                  hover:bg-[#E9EFF9]
                  active:scale-[0.97]
                "
              >
                <Plus size={14} className="text-[#8A95AC]" />
                Schedule a meeting
              </button>

            </div>

          ) : (

            <div className="space-y-2 pb-1">

              {agendaEvents.map((event, index) => {

                const eventDate = String(
                  event.date || event.start || ""
                ).slice(0, 10);

                return (

                  <div
                    key={event.id || index}
                    title={`${event.title} · ${formatAgendaDate(eventDate)}`}
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-[#E1E7F0]
                      bg-[#F7F8FC]
                      px-3 py-3
                      transition-colors
                      hover:bg-[#F2F4F9]
                    "
                  >

                    <div
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          event.backgroundColor || COLORS.navy,
                      }}
                    />

                    <div className="min-w-0 flex-1">

                      <p className="
                        truncate
                        text-[13px]
                        font-semibold
                        text-[#0A2E66]
                      ">
                        {event.title}
                      </p>

                      {agendaRange === "three" && (
                        <p className="mt-1 text-[11px] text-[#8491A8]">
                          {formatAgendaDate(eventDate)}
                        </p>
                      )}

                    </div>

                    <CalendarDays
                      size={16}
                      className="shrink-0 text-[#8A95AC]"
                    />

                  </div>

                );
              })}

              <button
                type="button"
                onClick={() => openEventDialog()}
                className="
                  mt-2 inline-flex
                  h-[35px]
                  items-center gap-1.5
                  rounded-[11px]
                  border border-[#E1E7F0]
                  bg-[#F7F8FC]
                  px-3
                  text-[12px]
                  font-bold
                  text-[#0A2E66]
                  hover:bg-[#E9EFF9]
                "
              >
                <Plus size={14} />
                Schedule a meeting
              </button>

            </div>

          )}

        </div>

      </section>

      {/* ================================== */}
      {/* CREATE EVENT DIALOG */}
      {/* ================================== */}

      <Dialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
      >

        <DialogContent
          className="
            w-[calc(100%-24px)]
            max-w-md
            overflow-hidden
            rounded-2xl
            border
            bg-white
            p-0
            sm:w-full
          "
          style={{
            borderColor: COLORS.line,
            color: COLORS.ink,
          }}
        >

          {/* Accent line */}
          <div className="
            h-1.5 w-full
            bg-gradient-to-r
            from-[#0A2E66]
            to-[#F27B1E]
          " />

          <div className="p-5 sm:p-6">

            <DialogHeader className="mb-5">

              <div className="
                mb-3 flex h-11 w-11
                items-center justify-center
                rounded-xl
                bg-[#EDE9FC]
                text-[#7050E8]
              ">
                <CalendarDays size={21} />
              </div>

              <DialogTitle className="
                text-xl
                font-bold
                tracking-tight
                text-[#0A2E66]
              ">
                Schedule a meeting
              </DialogTitle>

              <p className="text-sm text-[#56647D]">
                Create a calendar event for your selected date.
              </p>

            </DialogHeader>

            <form
              onSubmit={handleAddEvent}
              className="space-y-5"
            >

              {/* Event title */}
              <div>

                <label
                  htmlFor="calendar-event-title"
                  className="
                    mb-1.5 block
                    text-xs font-bold
                    text-[#0F1B33]
                  "
                >
                  Event title
                </label>

                <Input
                  id="calendar-event-title"
                  value={newEventTitle}
                  onChange={(e) =>
                    setNewEventTitle(e.target.value)
                  }
                  placeholder="e.g. Client follow-up"
                  required
                  maxLength={150}
                  className="
                    h-11 rounded-xl
                    border-[1.5px]
                    border-[#E1E7F0]
                    bg-white
                    shadow-none
                    focus-visible:ring-2
                    focus-visible:ring-[#7050E8]
                  "
                />

              </div>

              {/* Event date */}
              <div>

                <label className="
                  mb-1.5 flex items-center gap-2
                  text-xs font-bold
                  text-[#0F1B33]
                ">
                  <Clock3 size={14} className="text-[#7050E8]" />
                  Event date
                </label>

                <div className="
                  flex min-h-11
                  items-center gap-2
                  rounded-xl
                  border border-[#E1E7F0]
                  bg-[#F7F8FC]
                  px-3 py-2
                  text-sm text-[#56647D]
                ">
                  <CalendarDays
                    size={16}
                    className="shrink-0 text-[#7050E8]"
                  />

                  {selectedDate
                    ? formatAgendaDate(selectedDate)
                    : "Select a date"}
                </div>

              </div>

              {/* Event color */}
              <div>

                <div className="
                  mb-2 flex items-center
                  justify-between gap-2
                ">
                  <label className="
                    flex items-center gap-2
                    text-xs font-bold
                    text-[#0F1B33]
                  ">
                    <Palette size={14} className="text-[#7050E8]" />
                    Event color
                  </label>

                  <span className="text-[11px] text-[#8491A8]">
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
                        onClick={() =>
                          setNewEventColor(
                            selected ? "" : color
                          )
                        }
                        aria-label={`Choose event color ${color}`}
                        aria-pressed={selected}
                        title={color}
                        className="
                          flex h-9 w-9
                          items-center justify-center
                          rounded-full
                          transition-transform
                          hover:scale-105
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-offset-2
                        "
                        style={{
                          background: color,
                          outline: selected
                            ? `3px solid ${COLORS.purple}`
                            : "2px solid transparent",
                          outlineOffset: selected ? "3px" : "0",
                          boxShadow: selected
                            ? "0 0 0 5px #EDE9FC"
                            : "0 1px 3px rgba(15,27,51,.12)",
                        }}
                      >
                        {selected && (
                          <span className="
                            text-sm font-black
                            text-white
                          ">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}

                </div>

                <p className="mt-2 text-[11px] text-[#8491A8]">
                  {newEventColor || "Default color: Navy"}
                </p>

              </div>

              {/* Actions */}
              <div className="
                flex flex-col-reverse
                gap-2
                border-t border-[#E1E7F0]
                pt-4
                sm:flex-row
                sm:justify-end
              ">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={saving}
                  className="
                    h-10 rounded-xl
                    border-[#E1E7F0]
                    bg-white px-4
                    font-bold text-[#56647D]
                  "
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="
                    h-10 rounded-xl
                    border-b-[3px]
                    border-[#F27B1E]
                    bg-[#0A2E66]
                    px-5
                    font-bold text-white
                    hover:bg-[#12397A]
                    disabled:opacity-60
                  "
                >
                  {saving ? "Saving..." : "Save event"}
                </Button>

              </div>

            </form>

          </div>

        </DialogContent>

      </Dialog>
    </>
  );
};

export default AdminCalendar;
