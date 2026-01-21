import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const allEmployee = await Employee.find().select(
      "-basicDetails.address -basicDetails.dob -basicDetails.gender -basicDetails.joiningDate -basicDetails.profileImage -user -workDetails -createdAt -updatedAt -__v -basicDetails.phone"
    );
    return NextResponse.json({
      success: true,
      data: allEmployee,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}
