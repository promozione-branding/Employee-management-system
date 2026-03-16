import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    employee.basicDetails.resignedEmployee = true;
    employee.basicDetails.resignedDate = new Date();

    await employee.save();

    return NextResponse.json({
      success: true,
      message: "Employee marked as resigned",
      data: employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}