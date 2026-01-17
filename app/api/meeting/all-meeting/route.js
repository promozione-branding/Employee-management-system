import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const allMeetings = await Meeting.find().populate(
      "meetingUpdate.salesPersonId"
    );

    if (!allMeetings) {
      return NextResponse.json(
        {
          success: false,
          message: "cant font all meeting",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "get all meeting successfully",
        data: allMeetings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "server error",
    });
  }
}
