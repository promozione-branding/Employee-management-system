// app/api/calling/dashboard/daily-stats/[agentId]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import mongoose from "mongoose";

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

    // --- today range (IST) ---
    const now = new Date();
    // shift to IST for day boundary calc
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
    const startIST = new Date(
      nowIST.getFullYear(),
      nowIST.getMonth(),
      nowIST.getDate(),
    );
    const endIST = new Date(
      nowIST.getFullYear(),
      nowIST.getMonth(),
      nowIST.getDate() + 1,
    );
    const startOfDay = new Date(startIST.getTime() - IST_OFFSET_MS);
    const endOfDay = new Date(endIST.getTime() - IST_OFFSET_MS);

    const agentObjectId = new mongoose.Types.ObjectId(agentId);

    const result = await CallLog.aggregate([
      {
        $match: {
          agentErpUserId: agentObjectId,
          startedAt: { $gte: startOfDay, $lt: endOfDay },
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

    // Format talk time in minutes (1 decimal)
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
      date: startOfDay.toISOString(),
    });
  } catch (error) {
    console.error("[/api/calling/dashboard/daily-stats]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}