import { connectDB } from "@/lib/db";
import Meeting from "@/models/admin/meeting/Meeting";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Customer from "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const meetings = await Meeting.aggregate([
      // break meetingUpdate array into documents
      { $unwind: "$meetingUpdate" },

      // filter by salesperson
      {
        $match: {
          "meetingUpdate.salesPersonId": new mongoose.Types.ObjectId(id),
        },
      },

      // latest first
      {
        $sort: {
          "meetingUpdate.createdAt": -1,
        },
      },

      // only last 5
      { $limit: 5 },

      // get customer name only
      {
        $lookup: {
          from: "customers", // mongodb collection name
          localField: "meetingUpdate.clientId",
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

      // clean response
      {
        $project: {
          _id: "$meetingUpdate._id",
          updateType: "$meetingUpdate.updateType",
          status: "$meetingUpdate.status",
          note: "$meetingUpdate.note",
          meetingAt: "$meetingUpdate.meetingAt",
          reminderAt: "$meetingUpdate.reminderAt",
          createdAt: "$meetingUpdate.createdAt",
          clientName: "$client.name",
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Last 5 meeting updates",
        data: meetings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
