import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const findMeeting = await Meeting.findById(id);

    if (!findMeeting) {
      return NextResponse.json(
        {
          message: "meeting does not exist",
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
        message: "meeting details fetched successfully",
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

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const payload = await req.json();

    const updateMeeting = await Meeting.findByIdAndUpdate(
      id,
      {
        $push: { meetingUpdate: payload },
      },
      { new: true }
    );

    if (!updateMeeting) {
      return NextResponse.json(
        {
          success: false,
          message: "meeting not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "meeting updated successfully",
      data: updateMeeting,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating the meeting update",
      },
      { status: 500 }
    );
  }
}
