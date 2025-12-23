import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/meeting/Meeting";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const findMeeting = await Meeting.findById(id);
    if (!findMeeting) {
      return NextResponse.json(
        {
          message: "meeting does not exists",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: findMeeting,
      },
      { status: 200 }
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
