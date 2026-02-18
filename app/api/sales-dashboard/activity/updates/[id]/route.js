import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid salesPersonId" },
        { status: 400 }
      );
    }

    const meetings = await Meeting.aggregate([
      {
        $unwind: "$meetingUpdate",
      },
      {
        $match: {
          "meetingUpdate.salesPersonId": new mongoose.Types.ObjectId(id),
        },
      },
      {
        $replaceRoot: {
          newRoot: "$meetingUpdate",
        },
      },

      // ✅ JOIN CUSTOMER COLLECTION
      {
        $lookup: {
          from: "customers",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true,
        },
      },

      // ✅ return only needed fields
      {
        $project: {
          updateType: 1,
          status: 1,
          note: 1,
          meetingAt: 1,
          reminderAt: 1,
          reminderSent: 1,
          createdAt: 1,

          // client fields
          "client._id": 1,
          "client.name": 1,
          "client.company": 1,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
