import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const salesPeople = await User.find({
      role: { $in: ["sales"] },
    }).select("email");

    return NextResponse.json({
      success: true,
      message: "Sales people retrieved successfully.",
      data: salesPeople,
    });
  } catch (error) {
    console.error("Error fetching sales people:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching sales people.",
      },
      { status: 500 }
    );
  }
}
