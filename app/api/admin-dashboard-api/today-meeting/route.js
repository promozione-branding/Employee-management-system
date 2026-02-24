import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    /* ---------------- TODAY RANGE (LOCAL TIME SAFE) ---------------- */

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    /* ---------------- AGGREGATION ---------------- */

    const meetings = await Meeting.aggregate([
      // break meetingUpdate array
      { $unwind: "$meetingUpdate" },

      // filter today's meetings
      {
        $match: {
          "meetingUpdate.updateType": "meeting", // ✅ only meetings
          "meetingUpdate.meetingAt": {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },

      // join customer
      {
        $lookup: {
          from: "customers",
          localField: "meetingUpdate.clientId",
          foreignField: "_id",
          as: "clientDetails",
        },
      },

      {
        $unwind: {
          path: "$clientDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // final response shape
      {
        $project: {
          _id: "$meetingUpdate._id",
          meetingAt: "$meetingUpdate.meetingAt",
          updateType: "$meetingUpdate.updateType",
          status: "$meetingUpdate.status",
          note: "$meetingUpdate.note",
          clientName: "$clientDetails.name",
          company: "$clientDetails.company",
        },
      },

      // sort upcoming first
      { $sort: { meetingAt: 1 } },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Today's meetings fetched successfully",
        data: meetings,
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
