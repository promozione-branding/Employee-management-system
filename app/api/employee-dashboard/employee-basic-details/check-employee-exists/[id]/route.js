import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const isEmployeeExists = await Employee.findOne({ _id: id });

    if (!isEmployeeExists) {
      return NextResponse.json(
        {
          success: true,
          employeeExist: false,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        employeeExist: true,
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
      {
        status: 500,
      },
    );
  }
}
