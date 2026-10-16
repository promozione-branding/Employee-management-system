// app/api/calling/dashboard/daily-stats/[agentId]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import Employee from "@/models/employee/Employee";
import mongoose from "mongoose";

// ------------------------------------------------------------
// Get start/end of "today" in IST, as UTC Date objects
// ------------------------------------------------------------
function getISTDayRange() {
  const IST_OFFSET_MIN = 330; // +5:30
  const now = new Date();

  // shift to IST wall clock
  const nowIST = new Date(now.getTime() + IST_OFFSET_MIN * 60 * 1000);

  // start of day in IST wall clock
  const startIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  // shift back to UTC
  const startUTC = new Date(startIST.getTime() - IST_OFFSET_MIN * 60 * 1000);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);

  return { startUTC, endUTC };
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { agentId } = await params;
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid agent id" },
        { status: 400 },
      );
    }

    // --- resolve Employee from User id ---
    let employeeObjectId = null;

    const empByUser = await Employee.findOne({ user: agentId })
      .select("_id")
      .lean();
    if (empByUser) {
      employeeObjectId = empByUser._id;
    } else {
      const empById = await Employee.findById(agentId).select("_id").lean();
      if (empById) employeeObjectId = empById._id;
    }

    if (!employeeObjectId) {
      return NextResponse.json(
        { success: false, message: "Employee not found for this id" },
        { status: 404 },
      );
    }

    const { startUTC, endUTC } = getISTDayRange();

    console.log(
      "[daily-stats] IST day range (UTC):",
      startUTC.toISOString(),
      "→",
      endUTC.toISOString(),
      "| employee:",
      employeeObjectId,
    );

    const agentObjectId = new mongoose.Types.ObjectId(employeeObjectId);

    const result = await CallLog.aggregate([
      {
        $match: {
          agentErpUserId: agentObjectId,
          startedAt: { $gte: startUTC, $lt: endUTC },
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          connectedCalls: {
            $sum: { $cond: [{ $eq: ["$connected", true] }, 1, 0] },
          },
          missedCalls: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", ["missed", "failed", "busy", "cancelled"]],
                },
                1,
                0,
              ],
            },
          },
          inboundCalls: {
            $sum: { $cond: [{ $eq: ["$direction", "inbound"] }, 1, 0] },
          },
          outboundCalls: {
            $sum: { $cond: [{ $eq: ["$direction", "outbound"] }, 1, 0] },
          },
          totalDurationSeconds: { $sum: "$durationSeconds" },
          connectedDurationSeconds: {
            $sum: {
              $cond: [{ $eq: ["$connected", true] }, "$durationSeconds", 0],
            },
          },
          uniqueCustomers: { $addToSet: "$customerPhone" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCalls: 1,
          connectedCalls: 1,
          missedCalls: 1,
          inboundCalls: 1,
          outboundCalls: 1,
          totalDurationSeconds: 1,
          connectedDurationSeconds: 1,
          uniqueCustomerCount: {
            $size: {
              $filter: {
                input: "$uniqueCustomers",
                as: "c",
                cond: { $and: [{ $ne: ["$$c", null] }, { $ne: ["$$c", ""] }] },
              },
            },
          },
        },
      },
    ]);

    const stats = result[0] || {
      totalCalls: 0,
      connectedCalls: 0,
      missedCalls: 0,
      inboundCalls: 0,
      outboundCalls: 0,
      totalDurationSeconds: 0,
      connectedDurationSeconds: 0,
      uniqueCustomerCount: 0,
    };

    stats.totalTalkMinutes = +(stats.connectedDurationSeconds / 60).toFixed(1);
    stats.avgTalkSeconds = stats.connectedCalls
      ? Math.round(stats.connectedDurationSeconds / stats.connectedCalls)
      : 0;
    stats.connectRate =
      stats.totalCalls > 0
        ? Math.round((stats.connectedCalls / stats.totalCalls) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      message: "Today's call stats",
      data: stats,
      range: { startUTC, endUTC },
      employeeId: employeeObjectId,
    });
  } catch (error) {
    console.error("[/api/calling/dashboard/daily-stats]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}