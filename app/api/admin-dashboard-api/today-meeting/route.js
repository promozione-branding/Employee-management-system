// app/api/admin-dashboard-api/today-meeting/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Meeting from "@/models/admin/meeting/Meeting";

// ------------------------------------------------------------
// Compute UTC date range from preset + custom from/to (IST-aware)
// ------------------------------------------------------------
function getRange(preset, fromStr, toStr) {
  const IST_OFFSET_MIN = 330;
  const now = new Date();
  const nowIST = new Date(now.getTime() + IST_OFFSET_MIN * 60 * 1000);

  const startOfTodayIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      0, 0, 0, 0,
    ),
  );
  const startOfTodayUTC = new Date(
    startOfTodayIST.getTime() - IST_OFFSET_MIN * 60 * 1000,
  );

  const dayMs = 24 * 60 * 60 * 1000;

  if (preset === "yesterday") {
    return {
      from: new Date(startOfTodayUTC.getTime() - dayMs),
      to: startOfTodayUTC,
    };
  }
  if (preset === "tomorrow") {
    return {
      from: new Date(startOfTodayUTC.getTime() + dayMs),
      to: new Date(startOfTodayUTC.getTime() + 2 * dayMs),
    };
  }
  if (preset === "next3") {
    return {
      from: startOfTodayUTC,
      to: new Date(startOfTodayUTC.getTime() + 3 * dayMs),
    };
  }
  if (preset === "custom" && fromStr) {
    const fromDate = new Date(`${fromStr}T00:00:00+05:30`);
    let toDate;
    if (toStr) {
      toDate = new Date(`${toStr}T00:00:00+05:30`);
      toDate = new Date(toDate.getTime() + dayMs);
    } else {
      toDate = new Date(fromDate.getTime() + dayMs);
    }
    return { from: fromDate, to: toDate };
  }

  return {
    from: startOfTodayUTC,
    to: new Date(startOfTodayUTC.getTime() + dayMs),
  };
}

export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset") || "today";
    const fromStr = searchParams.get("from") || "";
    const toStr = searchParams.get("to") || "";

    const { from, to } = getRange(preset, fromStr, toStr);

    const pipeline = [
      { $unwind: "$meetingUpdate" },
      {
        $match: {
          "meetingUpdate.meetingAt": { $gte: from, $lt: to },
        },
      },
      { $sort: { "meetingUpdate.meetingAt": 1 } },
      {
        $lookup: {
          from: "customers",
          localField: "meetingUpdate.clientId",
          foreignField: "_id",
          as: "clientData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "meetingUpdate.salesPersonId",
          foreignField: "_id",
          as: "salesPersonData",
        },
      },
      {
        $project: {
          _id: "$meetingUpdate._id",
          clientId: "$meetingUpdate.clientId",
          clientName: { $arrayElemAt: ["$clientData.name", 0] },
          company: { $arrayElemAt: ["$clientData.company", 0] },
          salesPersonId: "$meetingUpdate.salesPersonId",
          salesPersonName: {
            $ifNull: [
              { $arrayElemAt: ["$salesPersonData.username", 0] },
              "Unknown",
            ],
          },
          updateType: "$meetingUpdate.updateType",
          status: "$meetingUpdate.status",
          note: "$meetingUpdate.note",
          meetingAt: "$meetingUpdate.meetingAt",
          reminderAt: "$meetingUpdate.reminderAt",
        },
      },
    ];

    const meetings = await Meeting.aggregate(pipeline);

    return NextResponse.json(
      {
        success: true,
        message: "All agents' meetings",
        data: meetings,
        range: { from, to, preset },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[admin today-meeting]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
