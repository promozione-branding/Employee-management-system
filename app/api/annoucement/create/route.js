// app/api/annoucement/create/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

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

    // Strip empty date strings — these were causing Mongoose CastError
    const payload = {
      title,
      content,
      targetDepartment,
      author: authUser?._id,
    };

    if (startDate && startDate !== "") payload.startDate = new Date(startDate);
    if (endDate && endDate !== "") payload.endDate = new Date(endDate);

    const announcement = await Announcement.create(payload);

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
        message:
          error?.message || "Server error while creating announcement",
      },
      { status: 500 },
    );
  }
}
