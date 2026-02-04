import { connectDB } from "@/lib/db";
import EmployeeCalendar from "@/models/employee/EmployeeCalendar";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const employeeCalendar = await EmployeeCalendar.findOne({ employeeId: id });

    if (!employeeCalendar) {
      return NextResponse.json(
        {
          message: "there is no employee calendar found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "calendar Data fetched successfully",
        data: employeeCalendar,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}
