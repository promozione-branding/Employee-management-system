import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeReminder from "@/models/employee/EmployeeReminder";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { employeeId, description, reminderAt, cc_email } = body;

    // 🔴 VALIDATION
    if (!employeeId || !description || !reminderAt) {
      return NextResponse.json(
        {
          success: false,
          message: "employeeId, description, reminderAt are required",
        },
        { status: 400 },
      );
    }

    // 🔍 FIND EMPLOYEE
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 },
      );
    }

    let reminderDoc;

    // 🔁 IF REMINDER DOC EXISTS
    if (employee.employeeReminderId) {
      reminderDoc = await EmployeeReminder.findById(
        employee.employeeReminderId,
      );

      reminderDoc.reminder.push({
        description,
        reminderAt,
        cc_email,
      });

      await reminderDoc.save();
    } else {
      // 🆕 CREATE NEW REMINDER DOC
      reminderDoc = await EmployeeReminder.create({
        employeeId,
        reminder: [
          {
            description,
            reminderAt,
            cc_email,
          },
        ],
      });

      //  LINK TO EMPLOYEE
      employee.employeeReminderId = reminderDoc._id;
      await employee.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reminder created and linked successfully",
        data: reminderDoc,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Employee Reminder Create Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating reminder",
      },
      { status: 500 },
    );
  }
}
