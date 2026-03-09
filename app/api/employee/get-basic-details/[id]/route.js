import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const employeeBasicDetails =
      await Employee.findById(id).select("basicDetails");

    return NextResponse.json(
      {
        success: true,
        message: "Success employee details",
        data: employeeBasicDetails,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
