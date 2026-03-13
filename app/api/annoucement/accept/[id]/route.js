import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return NextResponse.json(
        {
          message: "Announcement does not exist",
          success: false,
        },
        {
          status: 404,
        },
      );
    }

    announcement.accept = true;
    await announcement.save();

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: announcement,
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
