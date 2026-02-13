import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // ---- TODAY DATE RANGE ----
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // ---- AGGREGATION ----
    const result = await Meeting.aggregate([
      { $unwind: "$meetingUpdate" },

      {
        $match: {
          "meetingUpdate.salesPersonId":
            new mongoose.Types.ObjectId(id),

          "meetingUpdate.updateType": "call",

          "meetingUpdate.createdAt": {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },

      {
        $count: "totalCalls",
      },
    ]);

    const totalCalls = result[0]?.totalCalls || 0;

    return NextResponse.json(
      {
        success: true,
        message: "Today's call count",
        totalCalls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}