// app/api/annoucement/get/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const designation = searchParams.get("designation");

    // If designation given → filter by their dept + "ALL"
    // If not given → show all (admin/manager view)
    const filter = designation
      ? {
          targetDepartment: { $in: [designation, "ALL"] },
        }
      : {};

    const announcements = await Announcement.find(filter)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .limit(50);

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
