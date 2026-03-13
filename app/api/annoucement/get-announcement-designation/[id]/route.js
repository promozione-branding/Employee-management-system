import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const accouncement = await Announcement.find({
      targetDepartment: id,
      acknowled: false,
    })
      .select("title author startDate")
      .populate({ path: "author", select: "username" });

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: accouncement,
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
