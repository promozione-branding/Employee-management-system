import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeCalendar from "@/models/employee/EmployeeCalendar";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { employeeId, calendar } = await req.json();

    if (!calendar || !calendar.title || !calendar.date) {
      return NextResponse.json(
        { success: false, message: "Invalid calendar data" },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    let calendarData = await EmployeeCalendar.findOne({ employeeId });

    if (calendarData) {
      calendarData.calendar.push(calendar);
      await calendarData.save();
    } else {
      calendarData = await EmployeeCalendar.create({
        employeeId,
        calendar: [calendar],
      });

      employee.EmployeeCalendarId = calendarData._id;
      await employee.save();
    }

    return NextResponse.json(
      { success: true, message: "Calendar event added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
