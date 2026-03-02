import { NextResponse } from "next/server";
import Employee from "@/models/employee/Employee";
import { connectDB } from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();

    const employee = await Employee.find({
      "basicDetails.designation": "SALES",
    }).select("basicDetails.name _id");

    if (!employee.length) {
      return NextResponse.json(
        {
          success: false,
          message: "there is not employee of sales",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        data: employee,
        success: true,
        message: "Success",
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
