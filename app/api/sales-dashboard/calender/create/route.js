import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeCalendar from "@/models/employee/EmployeeCalendar";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { employeeId, calendar } = await req.json();

    const calendarItem = Array.isArray(calendar) ? calendar : [calendar];

    if (!calendarItem.length) {
      return NextResponse.json(
        {
          success: false,
          message: "calendar data required",
        },
        { status: 400 },
      );
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        {
          status: 404,
        },
      );
    }

    let calendarData = await EmployeeCalendar.findOne({ employeeId });

    if (calendarData) {
      calendarData.calendar.push(...calendarItem);
      await calendarData.save();
    } else {
      calendarData = await EmployeeCalendar.create({
        employeeId,
        calendar: calendarItem,
      });

      if (!calendarData) {
        return NextResponse.json(
          {
            success: false,
            message: "error while create the employee calendar",
          },
          {
            status: 500,
          },
        );
      }

      employee.EmployeeCalendarId = calendarData._id;
      await employee.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "calendar add successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
