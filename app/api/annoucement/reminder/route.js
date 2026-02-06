import { connectDB } from "@/lib/db";
import Announcement from "@/models/admin/Announcement";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const res = await Announcement.find();

    if (!res) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no annoucement",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "announcement",
        data: res,
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
      { status: 500 },
    );
  }
}
