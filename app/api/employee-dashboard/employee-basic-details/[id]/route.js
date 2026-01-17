import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const employeeId = await Employee.findById(id);

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "get employee by id",
        data: employeeId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 }
    );
  }
}
