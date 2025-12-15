"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

/* ===========================
   Your original data & chart code
   (kept intact)
   =========================== */

// ================= Sample Data (Bar Chart) =================
const barData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4200 },
  { name: "May", sales: 6200 },
];

// ================= Sample Data (Pie) =================
const pieData = [
  { name: "HR", value: 400 },
  { name: "Finance", value: 300 },
  { name: "Sales", value: 300 },
  { name: "Support", value: 200 },
];

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];

// ================= Your Line Chart Data =================
const lineData = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

// ================= Customized Dots =================
const CustomizedDot = (props) => {
  const { cx, cy, value } = props;

  if (!cx || !cy) return <g />;

  // Red dot for values > 2500
  if (value > 2500) {
    return (
      <svg
        x={cx - 10}
        y={cy - 10}
        width={20}
        height={20}
        fill="red"
        viewBox="0 0 1024 1024"
      >
        <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76z" />
      </svg>
    );
  }

  // Green dot otherwise
  return (
    <svg
      x={cx - 10}
      y={cy - 10}
      width={20}
      height={20}
      fill="green"
      viewBox="0 0 1024 1024"
    >
      <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352z" />
    </svg>
  );
};

/* ===========================
   FullCalendar + notifications + dark mode code
   (new code appended — won't change your original markup)
   =========================== */

/* Sample monthlySales + small spark (used for KPIs in extended dashboard; harmless) */
const monthlySales = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3200 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4200 },
  { name: "May", sales: 6200 },
  { name: "Jun", sales: 7100 },
];

const smallSpark = [
  { name: "1", value: 30 },
  { name: "2", value: 45 },
  { name: "3", value: 36 },
  { name: "4", value: 50 },
  { name: "5", value: 60 },
];

/* helper for IDs */
const uid = () => Math.random().toString(36).slice(2, 9);

const ATTENDANCE_COLORS = {
  Present: "#10b981",
  Absent: "#ef4444",
  Leave: "#f59e0b",
  Meeting: "#3b82f6",
};

export default function Home() {
  // -------------------------
  // Calendar + UI state (new)
  // -------------------------
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: uid(), title: "Payroll processed", time: "2h ago", read: false },
    { id: uid(), title: "New leave request from Amy", time: "6h ago", read: false },
    { id: uid(), title: "Server backup completed", time: "1d ago", read: true },
  ]);

  const [events, setEvents] = useState([
    {
      id: uid(),
      title: "All-hands meeting",
      start: new Date().toISOString().slice(0, 10),
      backgroundColor: ATTENDANCE_COLORS.Meeting,
      borderColor: ATTENDANCE_COLORS.Meeting,
    },
  ]);

  const calendarRef = useRef(null);

  // Inject FullCalendar CSS from CDN to avoid missing-css errors with Next/Turbopack
  useEffect(() => {
    const href = "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // apply dark class toggling (class strategy for Tailwind)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const pushNotification = (title) => {
    setNotifications((prev) => [{ id: uid(), title, time: "now", read: false }, ...prev]);
  };

  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const removeNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // -------------------------
  // FullCalendar handlers
  // -------------------------
  const handleDateClick = (arg) => {
    const choice = prompt(
      `Mark attendance for ${arg.dateStr}\nType: Present / Absent / Leave / Meeting`,
      "Present"
    );
    if (!choice) return;

    const label = choice.trim();
    const color = ATTENDANCE_COLORS[label] || "#888";
    const newEvent = {
      id: uid(),
      title: label,
      start: arg.dateStr,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
    };

    setEvents((prev) => [...prev, newEvent]);
    pushNotification(`Marked ${label} on ${arg.dateStr}`);
  };

  const handleSelect = (selectionInfo) => {
    const title = prompt(
      `Create event ${selectionInfo.startStr} → ${selectionInfo.endStr}`,
      "New Event"
    );
    if (!title) return;

    const newEvent = {
      id: uid(),
      title,
      start: selectionInfo.startStr,
      end: selectionInfo.endStr,
      backgroundColor: ATTENDANCE_COLORS.Meeting,
      borderColor: ATTENDANCE_COLORS.Meeting,
    };

    setEvents((prev) => [...prev, newEvent]);
    pushNotification(`Created event: ${title}`);
  };

  const handleEventClick = (clickInfo) => {
    const action = prompt(
      `Edit title or type "delete"\nCurrent: ${clickInfo.event.title}`,
      clickInfo.event.title
    );
    if (!action) return;

    if (action.toLowerCase() === "delete") {
      setEvents((prev) => prev.filter((e) => e.id !== clickInfo.event.id));
      pushNotification("Event deleted");
    } else {
      setEvents((prev) => prev.map((e) => (e.id === clickInfo.event.id ? { ...e, title: action } : e)));
      pushNotification("Event updated");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // -------------------------
  // RENDER (keeps your original layout unchanged)
  // -------------------------
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Main Content (your original code unchanged) */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold ">Dashboard Overview</h2>

          <div className="flex items-center gap-3">
            {/* Download button preserved */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Download Report
            </button>

            {/* Dark toggle (new, small, non-intrusive) */}
            <button
              onClick={() => setIsDark((s) => !s)}
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
              title="Toggle dark"
            >
              {isDark ? "Light" : "Dark"}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Notifications</h4>
                      <button className="text-sm text-blue-600" onClick={() => setNotifications([])}>Clear</button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-auto">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No notifications</div>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${n.read ? "opacity-70" : ""}`}>
                        <div className="w-2.5 h-2.5 rounded-full mt-2" style={{ background: n.read ? "#94a3b8" : "#ef4444" }} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-gray-400">{n.time}</div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded" onClick={() => { markAsRead(n.id); }}>Mark read</button>
                            <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded" onClick={() => removeNotification(n.id)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

   
       {/* Top Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
    <h3 className="text-gray-500 dark:text-gray-400">Total Customers</h3>
    <p className="text-3xl font-bold mt-2">120</p>

    {/* Mini Sparkline */}
    <div className="h-12 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={smallSpark}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
    <h3 className="text-gray-500 dark:text-gray-400">Client Happiness Index </h3>
    <p className="text-3xl font-bold mt-2">98</p>

    <div className="h-12 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={smallSpark}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
    <h3 className="text-gray-500 dark:text-gray-400">Pending Leaves</h3>
    <p className="text-3xl font-bold mt-2">12</p>

    <div className="h-12 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={smallSpark}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col">
    <h3 className="text-gray-500 dark:text-gray-400">Payroll Processed</h3>
    <p className="text-3xl font-bold mt-2">$52,000</p>

    <div className="h-12 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={smallSpark}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>


        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========== Line Chart Section (Your Chart Added Here) ========== */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="pv"
                stroke="#8884d8"
                dot={CustomizedDot}
              />

              <Line
                type="monotone"
                dataKey="uv"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ===========================
            FULLCALENDAR: ADDED AT THE VERY BOTTOM (Option D)
           =========================== */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Attendance Calendar</h3>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            selectable
            select={handleSelect}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={events}
            height="auto"
            ref={calendarRef}
          />

          <div className="mt-3 text-xs text-gray-500">
            Tip: Click a date to mark attendance (Present / Absent / Leave). Drag to create a new event.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----------------------
   Mini components below
   ---------------------- */

function KpiCard({ title, value, change, children, onClick }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        <div className={`text-sm mt-1 ${change && change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>{change}</div>
      </div>

      <div style={{ width: 90, height: 50 }}>
        {children}
      </div>
    </div>
  );
}

function MiniSpark({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke="#7c3aed" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* -------- Spark Chart ---------- */

// function MiniSpark({ data }) {
//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={data}>
//         <Line
//           type="monotone"
//           dataKey="value"
//           stroke="#fff"
//           strokeWidth={2}
//           dot={false}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// }
