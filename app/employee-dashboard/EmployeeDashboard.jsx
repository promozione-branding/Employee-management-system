// app/employee-dashboard/EmployeeDashboard.jsx


"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
} from "lucide-react";

import EmployeeCalendar from "@/components/employee-dashboard/common/EmployeeCalendar";
import EmployeeTodo from "@/components/employee-dashboard/common/EmployeeTodo";
import EmployeeReminder from "@/components/employee-dashboard/common/EmployeeReminder";
import EmployeeClientsProgress from "@/components/employee-dashboard/common/EmployeeClientsProgress";
import EmployeeAnnouncements from "@/components/employee-dashboard/common/Announcement";
import RecentActivity from "@/components/employee-dashboard/common/RecentActivity";
import AllEmployeeContact from "@/components/employee-dashboard/common/AllEmployeeContact";
import EmployeeAssigedClient from "@/components/employee-dashboard/common/EmployeeAssigedClient";

import { useEmployeeStore } from "@/lib/store/EmployeeStore";

// Dynamic greeting based on current time
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const EmployeeDashboard = () => {
  const { employee } = useEmployeeStore();

  const [greeting, setGreeting] = useState("Welcome");

  // Set greeting based on current time
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Get logged-in employee's name
  const userName =
    employee?.basicDetails?.name ||
    employee?.basicDetails?.email?.split("@")[0] ||
    "there";

  return (
    <div className="mx-auto w-full max-w-[1560px] min-w-0 space-y-6 sm:space-y-7 lg:space-y-8">

      {/* Personalized Employee Greeting */}
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#0A2E66] px-6 pb-7 pt-[82px] shadow-[0_8px_24px_rgba(10,46,102,0.12)] sm:px-8 sm:pb-8 lg:px-[38px]">

        {/* Top Decorative Striped Awning */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[50px] overflow-hidden">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className={`relative h-[50px] min-w-[33px] flex-1 ${
                index % 2 === 0
                  ? "bg-[#F5A052]"
                  : index % 4 === 1
                    ? "bg-[#FFF2E5]"
                    : "bg-[#3769A9]"
              }`}
              style={{
                borderRadius: "0 0 20px 20px",
                marginRight: "-1px",
              }}
            />
          ))}
        </div>

        {/* Background Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-[#315A91]/25 blur-[80px]" />

        <div className="relative z-20">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            {/* Greeting Content */}
            <div className="min-w-0 flex-1">

              {/* Current Date */}
              <p className="mb-1 text-[16px] font-semibold tracking-tight text-[#F58220]">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              {/* Dynamic Greeting */}
              <h1 className="font-serif text-[34px] font-bold leading-[1.15] tracking-tight text-white sm:text-[40px] lg:text-[46px]">
                {greeting}, {userName}
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-[570px] text-[16px] font-medium leading-[1.7] text-[#C6D3E8] sm:text-[17px]">
                Welcome back to your workspace. Stay focused on your tasks,
                track client progress, manage reminders, and keep up with
                your daily activities.
              </p>

            </div>

            {/* Workspace Information */}
            <div className="flex shrink-0 items-center self-start rounded-2xl border border-white/15 bg-[#315487] px-4 py-3.5 shadow-sm lg:self-center">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <CalendarDays size={22} />
              </div>

              <div className="ml-3">
                <p className="text-xs font-medium text-[#C6D3E8]">
                  Your workspace
                </p>

                <p className="mt-1 text-[15px] font-bold text-white">
                  Employee overview
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Calendar, Todo and Client Progress */}
      <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3 [&>*]:min-w-0">

        <EmployeeCalendar employeeId={employee?._id} />

        <EmployeeTodo employeeId={employee?._id} />

        <EmployeeClientsProgress employeeId={employee?._id} />

      </section>

      {/* Reminders, Assigned Clients and Recent Activity */}
      <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">

        <EmployeeReminder employeeId={employee?._id} />

        <EmployeeAssigedClient employeeId={employee?._id} />

        <RecentActivity employeeId={employee?._id} />

      </section>

      {/* Announcements and Employee Contacts */}
      <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">

        <EmployeeAnnouncements />

        <AllEmployeeContact />

      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#E3E7F0] pt-4 text-xs text-[#8A92A6] sm:flex-row sm:items-center sm:justify-between">

        <p>Inquiry Bazaar · Employee workspace</p>

        <p className="flex items-center gap-1.5">
          <Clock3 size={13} />
          Your daily work overview in one place
        </p>

      </footer>

    </div>
  );
};

export default EmployeeDashboard;
