import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const allEmployee = await User.find({ role: "employee" }).select("email username");

    return NextResponse.json(
      {
        success: true,
        message: "All Employee fetched",
        data: allEmployee,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
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
