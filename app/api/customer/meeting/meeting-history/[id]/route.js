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
        populate: {
          path: "meetingUpdate.salesPersonId",
          select: "username email",
        },
      });

    if (!meetingHistory) {
      return NextResponse.json(
        {
          success: false,
          message: "meet history not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "customer meeting history fetched",
        data: meetingHistory,
      },
      {
        status: 200,
      }
    );
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
