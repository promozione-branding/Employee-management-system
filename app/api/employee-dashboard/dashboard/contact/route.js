import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const contact = await Employee.find().select("basicDetails.name basicDetails.email basicDetails.designation basicDetails.profileImage basicDetails.phone");

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no contact",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "all contact of employee",
        data: contact,
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
