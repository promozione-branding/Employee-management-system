import "@/models/User";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Customer from "@/models/Customer";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const meetingHistory = await Customer.findById(id)
      .select("meetingUpdate")
      .populate({
        path: "meetingUpdate",
        select: "_id",
      });

    if (meetingHistory?.meetingUpdate) {
      return NextResponse.json(
        {
          success: true,
          message: "Already Meeting exists",
          newMeeting: false,
          data: meetingHistory,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "Create new meeting",
          newMeeting: true,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while fetch customer meeting history",
      },
      {
        status: 500,
      }
    );
  }
}
