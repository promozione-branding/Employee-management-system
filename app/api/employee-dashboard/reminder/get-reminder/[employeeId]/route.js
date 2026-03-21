import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EmployeeReminder from "@/models/employee/EmployeeReminder";
import Employee from "@/models/employee/Employee";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 },
      );
    }

    // 🔍 Find reminder document
    const reminderDoc = await EmployeeReminder.findOne({
      employeeId,
    })
      .select("reminder")
      .lean()
      .limit(20);

    if (!reminderDoc) {
      return NextResponse.json(
        {
          success: true,
          message: "No reminders found",
          data: { reminder: [] },
        },
        { status: 200 },
      );
    }

    // Sort reminders by newest reminderAt
    if (reminderDoc.reminder && Array.isArray(reminderDoc.reminder)) {
      reminderDoc.reminder.sort(
        (a, b) => new Date(b.reminderAt) - new Date(a.reminderAt),
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee reminders fetched successfully",
        data: reminderDoc,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET REMINDER ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching reminders",
      },
      { status: 500 },
    );
  }
}
