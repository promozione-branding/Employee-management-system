import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import Employee from "@/models/employee/Employee";
import User from "@/models/admin/User";

export async function GET(req) {
  try {
    await connectDB();

    const announcements = await Announcement.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json(
      {
        success: true,
        message: "Announcements fetched successfully",
        data: announcements,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching announcements",
      },
      { status: 500 },
    );
  }
}
