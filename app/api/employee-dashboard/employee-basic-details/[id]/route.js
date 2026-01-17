import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import mongoose from "mongoose";
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
        { status: 404 },
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

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // 🛑 VALID OBJECT ID CHECK
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid employee id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // 🚫 NEVER allow these to be edited
    delete body.employeeId;
    delete body.user;
    delete body.createdAt;
    delete body.updatedAt;

    // 🔄 UPDATE EMPLOYEE
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("EDIT EMPLOYEE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

