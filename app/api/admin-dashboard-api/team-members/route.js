import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const teamMember = await Employee.find({"basicDetails.resignedEmployee": false}).select(
      "basicDetails.name basicDetails.profileImage basicDetails.designation  _id",
    );

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: teamMember,
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
