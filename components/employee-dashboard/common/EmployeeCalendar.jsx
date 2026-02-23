// "use client";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import toast from "react-hot-toast";
// import {
//   createCalendarService,
//   getCalendarService,
// } from "@/service/employee-dashboard/calendar";
// import { eventColors } from "@/config/employee/staticData";

// const EmployeeCalendar = ({ employeeId }) => {
//   const [events, setEvents] = useState([]);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [newEventTitle, setNewEventTitle] = useState("");
//   const [newEventColor, setNewEventColor] = useState("");
//   const [selectedDate, setSelectedDate] = useState(null);

//   const handleDateClick = (arg) => {
//     setSelectedDate(arg.dateStr);
//     setIsDialogOpen(true);
//   };

//   const handleAddEvent = async (e) => {
//     e.preventDefault();

//     if (!newEventTitle || !selectedDate) return;

//     const calendarItem = {
//       title: newEventTitle,
//       date: selectedDate,
//       backgroundColor: newEventColor || "#3b82f6",
//     };

//     try {
//       const res = await createCalendarService({
//         employeeId,
//         calendar: calendarItem,
//       });

//       if (res.success) {
//         setEvents((prev) => [
//           ...prev,
//           { ...calendarItem, start: calendarItem.date },
//         ]);

//         toast.success(res.message || "Calendar event added");

//         setNewEventTitle("");
//         setNewEventColor("");
//         setIsDialogOpen(false);
//       }
//     } catch (error) {
//       console.error(error);
    
//     }
//   };

//   async function getCalendarItem() {
//     try {
//       if (employeeId) {
//         const res = await getCalendarService(employeeId);
//         if (res.success) {
//           const events = res.data.calendar.map((item) => ({
//             ...item,
//             start: item.date,
//           }));
//           setEvents(events);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(
//         error.response?.data?.message || "Error while get calendar items",
//       );
//     }
//   }

//   let tooltipEl = null;

//   const handleEventMouseEnter = (info) => {
//     tooltipEl = document.createElement("div");

//     tooltipEl.innerHTML = `
//   <strong>${info.event.title}</strong><br/>
//   ${info.event.start.toLocaleDateString()}
// `;

//     tooltipEl.style.position = "absolute";
//     tooltipEl.style.background = info.event.backgroundColor || "#111";
//     tooltipEl.style.color = "#fff";
//     tooltipEl.style.padding = "6px 10px";
//     tooltipEl.style.borderRadius = "6px";
//     tooltipEl.style.fontSize = "12px";
//     tooltipEl.style.pointerEvents = "none";
//     tooltipEl.style.zIndex = "9999";
//     tooltipEl.style.whiteSpace = "nowrap";

//     document.body.appendChild(tooltipEl);

//     info.el.addEventListener("mousemove", moveTooltip);
//   };

//   const moveTooltip = (e) => {
//     if (tooltipEl) {
//       tooltipEl.style.top = e.pageY + 10 + "px";
//       tooltipEl.style.left = e.pageX + 10 + "px";
//     }
//   };

//   const handleEventMouseLeave = (info) => {
//     info.el.removeEventListener("mousemove", moveTooltip);
//     if (tooltipEl) {
//       tooltipEl.remove();
//       tooltipEl = null;
//     }
//   };

//   useEffect(() => {
//     getCalendarItem();
//   }, [employeeId]);

//   return (
//     <div className="flex gap-2 items-start lg:w-[65vw] w-full">
//       <div className="mb-8 border rounded-lg">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="calendar-wrapper">
//             <FullCalendar
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView="dayGridMonth"
//               headerToolbar={{
//                 left: "prev,next today",
//                 center: "title",
//                 right: "dayGridMonth,timeGridWeek,timeGridDay",
//               }}
//               events={events}
//               height="auto"
//               contentHeight="auto"
//               dateClick={handleDateClick}
//               eventMouseEnter={handleEventMouseEnter}
//               eventMouseLeave={handleEventMouseLeave}
//             />
//           </div>
//         </div>
//       </div>
//       <div className="lg:w-1/2"></div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add New Event</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAddEvent} className="space-y-4">
//             <div>
//               <label className="text-sm font-medium mb-1 block">
//                 Event Title
//               </label>
//               <Input
//                 value={newEventTitle}
//                 onChange={(e) => setNewEventTitle(e.target.value)}
//                 placeholder="Enter event title"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium mb-1 block">Flag</label>
//               <div className="flex gap-2 flex-wrap">
//                 {eventColors.map((color) => (
//                   <div
//                     key={color}
//                     onClick={() => setNewEventColor(color)}
//                     className={`h-8 w-8 rounded-full cursor-pointer ${
//                       newEventColor === color
//                         ? "ring-2 ring-offset-2 ring-black"
//                         : ""
//                     }`}
//                     style={{ backgroundColor: color }}
//                   />
//                 ))}
//               </div>
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">Save</Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default EmployeeCalendar;




// new here 

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

  /* ---------------- DATE CLICK ---------------- */
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsDialogOpen(true);
  };

  /* ---------------- ADD EVENT ---------------- */
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!newEventTitle || !selectedDate) {
      toast.error("Please enter event title");
      return;
    }

    const calendarItem = {
      title: newEventTitle,
      date: selectedDate,
      backgroundColor: newEventColor || "#ea580c", // orange-600
    };

    try {
      const res = await createCalendarService({
        employeeId,
        calendar: calendarItem,
      });

      if (res.success) {
        setEvents((prev) => [
          ...prev,
          { ...calendarItem, start: calendarItem.date },
        ]);

        toast.success(res.message || "Event added successfully");

        setNewEventTitle("");
        setNewEventColor("");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add event");
    }
  };

  /* ---------------- FETCH EVENTS ---------------- */
  async function getCalendarItem() {
    try {
      if (!employeeId) return;

      const res = await getCalendarService(employeeId);

      if (res.success) {
        const formatted = res.data.calendar.map((item) => ({
          ...item,
          start: item.date,
        }));

        setEvents(formatted);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error loading calendar"
      );
    }
  }

  /* ---------------- TOOLTIP ---------------- */
  let tooltipEl = null;

  const handleEventMouseEnter = (info) => {
    tooltipEl = document.createElement("div");

    tooltipEl.innerHTML = `
      <strong>${info.event.title}</strong><br/>
      ${info.event.start.toLocaleDateString()}
    `;

    tooltipEl.style.position = "absolute";
    tooltipEl.style.background = info.event.backgroundColor || "#ea580c";
    tooltipEl.style.color = "#fff";
    tooltipEl.style.padding = "6px 10px";
    tooltipEl.style.borderRadius = "6px";
    tooltipEl.style.fontSize = "12px";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.zIndex = "9999";

    document.body.appendChild(tooltipEl);
    info.el.addEventListener("mousemove", moveTooltip);
  };

  const moveTooltip = (e) => {
    if (!tooltipEl) return;
    tooltipEl.style.top = e.pageY + 12 + "px";
    tooltipEl.style.left = e.pageX + 12 + "px";
  };

  const handleEventMouseLeave = (info) => {
    info.el.removeEventListener("mousemove", moveTooltip);
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  };

  useEffect(() => {
    getCalendarItem();
  }, [employeeId]);

  /* ================= UI ================= */

  return (
    <div className="w-full flex flex-col gap-6">
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5  lg:w-[60vw]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Employee Calendar
          </h2>

          <div className="text-sm text-gray-500">
            Click any date to add event
          </div>
        </div>

        {/* CALENDAR */}
        <div className="calendar-wrapper rounded-xl overflow-hidden lg:h-[70vh]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
            dateClick={handleDateClick}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
          />
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add New Event
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddEvent} className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Event Title
              </label>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Meeting, Follow-up, Demo..."
                className="mt-2 focus-visible:ring-orange-600"
              />
            </div>

            {/* COLOR PICKER */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Event Flag
              </label>

              <div className="flex flex-wrap gap-3 mt-2">
                {eventColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    className={`h-8 w-8 rounded-full transition-all
                      ${
                        newEventColor === color
                          ? "ring-2 ring-orange-600 ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Save Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeCalendar;
