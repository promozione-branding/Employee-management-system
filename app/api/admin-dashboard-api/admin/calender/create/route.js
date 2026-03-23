import mongoose from "mongoose";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";
import { connectDB } from "@/lib/db";
import AdminCalendar from "@/models/admin/adminDetails/AdminCalender";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, calendar } = body;

    // ✅ Validation
    if (!userId || !Array.isArray(calendar)) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    // ✅ Optional: check user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🔥 CORE LOGIC (THIS SOLVES YOUR PROBLEM)
    const result = await AdminCalendar.findOneAndUpdate(
      { userId }, // find by userId
      {
        $push: {
          calendar: { $each: calendar }, // push into array
        },
      },
      {
        new: true,
        upsert: true, // ✅ if not exist → create
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Calender saved successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}