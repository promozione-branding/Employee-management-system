import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (
      !body?.basicDetails?.name ||
      !body?.basicDetails?.designation ||
      !body?.basicDetails?.phone ||
      !body?.basicDetails?.address ||
      !body?.basicDetails?.gender ||
      !body?.basicDetails?.email?.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required employee fields missing",
        },
        { status: 400 },
      );
    }

    // 🆕 CREATE EMPLOYEE
    const employee = await Employee.create(body);

    if (employee?.user) {
      await User.findByIdAndUpdate(employee.user, { employeeId: employee._id });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        data: employee,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    // 🛑 DUPLICATE KEY ERROR (employeeId)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate employee record",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
