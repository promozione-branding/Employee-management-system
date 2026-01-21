import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      employeeId,
      clientId,
      department,
      checklist = [],
      status = "IN_PROGRESS",
      progressPercentage = 0,
      startedAt,
    } = body;

    // Basic validation
    if (!employeeId || !clientId || !department) {
      return NextResponse.json(
        { message: "employeeId, clientId and department are required" },
        { status: 400 },
      );
    }

    const workDetail = await EmployeeWorkDetail.create({
      employeeId,
      clientId,
      department,
      checklist,
      status,
      progressPercentage,
      startedAt,
    });

    await Employee.updateMany(
      { _id: { $in: Array.isArray(employeeId) ? employeeId : [employeeId] } },
      { $push: { workDetails: workDetail?._id } },
    );

    return NextResponse.json(
      {
        message: "Employee work detail created successfully",
        data: workDetail,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create EmployeeWorkDetail Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
