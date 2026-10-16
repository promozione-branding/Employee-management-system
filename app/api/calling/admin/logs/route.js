// app/api/calling/admin/logs/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import mongoose from "mongoose";

// Helper — date range from query
function getDateRange(searchParams) {
  const preset = searchParams.get("preset") || "today";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const now = new Date();
  const IST_OFFSET_MIN = 330;
  const nowIST = new Date(now.getTime() + IST_OFFSET_MIN * 60 * 1000);

  const startIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      0, 0, 0, 0,
    ),
  );
  const startUTC = new Date(startIST.getTime() - IST_OFFSET_MIN * 60 * 1000);

  let fromDate, toDate;

  if (preset === "custom" && from && to) {
    fromDate = new Date(from);
    toDate = new Date(to);
    // if to has no time part, extend to end of day
    if (!to.includes("T")) {
      toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
    }
  } else if (preset === "yesterday") {
    fromDate = new Date(startUTC.getTime() - 24 * 60 * 60 * 1000);
    toDate = startUTC;
  } else if (preset === "7d") {
    fromDate = new Date(startUTC.getTime() - 6 * 24 * 60 * 60 * 1000);
    toDate = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  } else if (preset === "30d") {
    fromDate = new Date(startUTC.getTime() - 29 * 24 * 60 * 60 * 1000);
    toDate = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  } else {
    // today (default)
    fromDate = startUTC;
    toDate = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  }

  return { fromDate, toDate };
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

    const allowed = ["admin", "ADMIN", "manager", "MANAGER", "SR_MANAGER"];
    if (!allowed.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100,
    );
    const agentId = searchParams.get("agentId") || "";
    const status = searchParams.get("status") || "";
    const direction = searchParams.get("direction") || "";
    const q = (searchParams.get("q") || "").trim();

    const { fromDate, toDate } = getDateRange(searchParams);

    // Build match
    const match = {
      startedAt: { $gte: fromDate, $lt: toDate },
    };

    if (agentId && mongoose.Types.ObjectId.isValid(agentId)) {
      match.agentErpUserId = new mongoose.Types.ObjectId(agentId);
    }

    if (status === "connected") {
      match.connected = true;
    } else if (status === "missed") {
      match.status = { $in: ["missed", "failed", "busy", "cancelled"] };
    } else if (status === "failed") {
      match.status = "failed";
    }

    if (direction === "inbound" || direction === "outbound") {
      match.direction = direction;
    }

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      match.$or = [
        { customerName: rx },
        { customerPhone: rx },
        { agentName: rx },
        { agentEmail: rx },
      ];
    }

    const skip = (page - 1) * limit;

    // Fetch logs + count + summary in parallel
    const [logs, total, summaryRaw] = await Promise.all([
      CallLog.find(match)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallLog.countDocuments(match),
      CallLog.aggregate([
        { $match: match },
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
                    $in: [
                      "$status",
                      ["missed", "failed", "busy", "cancelled"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalDurationSeconds: { $sum: "$durationSeconds" },
          },
        },
      ]),
    ]);

    const summary = summaryRaw[0] || {
      totalCalls: 0,
      connectedCalls: 0,
      missedCalls: 0,
      totalDurationSeconds: 0,
    };
    summary.totalTalkMinutes = +(summary.totalDurationSeconds / 60).toFixed(1);
    summary.connectRate = summary.totalCalls
      ? Math.round((summary.connectedCalls / summary.totalCalls) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      summary,
      range: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error("[/api/calling/admin/logs]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
