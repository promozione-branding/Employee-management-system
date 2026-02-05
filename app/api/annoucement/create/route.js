import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import { getAuthUser } from "@/lib/getAuthUser"; // if you already use auth

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // 🔐 AUTH (optional but recommended)
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const {
      title,
      content,
      targetDepartment = "ALL",
      startDate,
      endDate,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and content are required",
        },
        { status: 400 },
      );
    }

    // 🧾 CREATE ANNOUNCEMENT
    const announcement = await Announcement.create({
      title,
      content,
      targetDepartment,
      startDate,
      endDate,
      author: authUser?._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Announcement created successfully",
        data: announcement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating announcement",
      },
      { status: 500 },
    );
  }
}
