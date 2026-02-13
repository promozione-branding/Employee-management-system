import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid salesPersonId" },
        { status: 400 },
      );
    }

    const now = new Date();

    const startOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const endOfDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const meetings = await Meeting.aggregate([
      { $unwind: "$meetingUpdate" },

      {
        $match: {
          "meetingUpdate.salesPersonId": new mongoose.Types.ObjectId(id),
          "meetingUpdate.meetingAt": {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },

      {
        $lookup: {
          from: "customers",
          localField: "meetingUpdate.clientId",
          foreignField: "_id",
          as: "clientDetails",
        },
      },

      { $unwind: { path: "$clientDetails", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: "$meetingUpdate._id",
          meetingAt: "$meetingUpdate.meetingAt",
          updateType: "$meetingUpdate.updateType",
          clientId: "$clientDetails._id",
          clientName: "$clientDetails.name", // 👈 only name
        },
      },

      { $sort: { meetingAt: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      message: "Today's meetings",
      data: meetings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
