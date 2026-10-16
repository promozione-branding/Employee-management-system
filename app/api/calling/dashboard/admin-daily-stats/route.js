// app/api/calling/dashboard/admin-daily-stats/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import Employee from "@/models/employee/Employee";
import mongoose from "mongoose";

// ------------------------------------------------------------
// IST "today" range as UTC Dates
// ------------------------------------------------------------
function getISTDayRange() {
  const IST_OFFSET_MIN = 330;
  const now = new Date();
  const nowIST = new Date(now.getTime() + IST_OFFSET_MIN * 60 * 1000);
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
  const startUTC = new Date(startIST.getTime() - IST_OFFSET_MIN * 60 * 1000);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  return { startUTC, endUTC };
}

export async function GET(req) {
  try {
    await connectDB();

    // --- auth ---
    const user = await getAuthUser(req);
    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admin / manager roles allowed
    const allowedRoles = ["admin", "ADMIN", "manager", "MANAGER", "SR_MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { startUTC, endUTC } = getISTDayRange();

    // ------------------------------------------------------------
    // Aggregate CallLog grouped by agent
    // ------------------------------------------------------------
    const rows = await CallLog.aggregate([
      {
        $match: {
          startedAt: { $gte: startUTC, $lt: endUTC },
        },
      },
      {
        $group: {
          _id: "$agentErpUserId",
          agentName: { $first: "$agentName" },
          agentEmail: { $first: "$agentEmail" },
          agentMyopUserId: { $first: "$agentMyopUserId" },
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
          lastCallAt: { $max: "$startedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          agentErpUserId: "$_id",
          agentName: 1,
          agentEmail: 1,
          agentMyopUserId: 1,
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
          lastCallAt: 1,
        },
      },
      { $sort: { totalCalls: -1 } },
    ]);

    // ------------------------------------------------------------
    // Compute derived fields
    // ------------------------------------------------------------
    const agents = rows.map((r) => ({
      ...r,
      totalTalkMinutes: +(r.connectedDurationSeconds / 60).toFixed(1),
      avgTalkSeconds: r.connectedCalls
        ? Math.round(r.connectedDurationSeconds / r.connectedCalls)
        : 0,
      connectRate:
        r.totalCalls > 0
          ? Math.round((r.connectedCalls / r.totalCalls) * 100)
          : 0,
    }));

    // Totals across everyone
    const totals = agents.reduce(
      (acc, a) => {
        acc.totalCalls += a.totalCalls;
        acc.connectedCalls += a.connectedCalls;
        acc.missedCalls += a.missedCalls;
        acc.inboundCalls += a.inboundCalls;
        acc.outboundCalls += a.outboundCalls;
        acc.connectedDurationSeconds += a.connectedDurationSeconds;
        return acc;
      },
      {
        totalCalls: 0,
        connectedCalls: 0,
        missedCalls: 0,
        inboundCalls: 0,
        outboundCalls: 0,
        connectedDurationSeconds: 0,
      },
    );

    totals.totalTalkMinutes = +(totals.connectedDurationSeconds / 60).toFixed(1);
    totals.agentCount = agents.length;
    totals.connectRate =
      totals.totalCalls > 0
        ? Math.round((totals.connectedCalls / totals.totalCalls) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      message: "Admin daily call stats",
      data: { agents, totals },
      range: { startUTC, endUTC },
    });
  } catch (error) {
    console.error("[/api/calling/dashboard/admin-daily-stats]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}