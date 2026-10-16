// app/api/calling/admin/logs/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import mongoose from "mongoose";

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
    if (!to.includes("T")) {
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

    const [logs, total, summaryRaw, agentPerfRaw] = await Promise.all([
      CallLog.find(match).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
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
      CallLog.aggregate([
        {
          $match: {
            startedAt: { $gte: fromDate, $lt: toDate },
            ...(status === "connected"
              ? { connected: true }
              : status === "missed"
                ? { status: { $in: ["missed", "failed", "busy", "cancelled"] } }
                : {}),
            ...(direction ? { direction } : {}),
          },
        },
        {
          $group: {
            _id: "$agentErpUserId",
            agentName: { $first: "$agentName" },
            agentEmail: { $first: "$agentEmail" },
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
            inboundCalls: {
              $sum: { $cond: [{ $eq: ["$direction", "inbound"] }, 1, 0] },
            },
            outboundCalls: {
              $sum: { $cond: [{ $eq: ["$direction", "outbound"] }, 1, 0] },
            },
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
            agentErpUserId: "$_id",
            agentName: 1,
            agentEmail: 1,
            totalCalls: 1,
            connectedCalls: 1,
            missedCalls: 1,
            inboundCalls: 1,
            outboundCalls: 1,
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
        { $sort: { totalCalls: -1 } },
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

    const agentPerformance = agentPerfRaw.map((r) => ({
      ...r,
      totalTalkMinutes: +(r.connectedDurationSeconds / 60).toFixed(1),
      avgTalkSeconds: r.connectedCalls
        ? Math.round(r.connectedDurationSeconds / r.connectedCalls)
        : 0,
      connectRate: r.totalCalls
        ? Math.round((r.connectedCalls / r.totalCalls) * 100)
        : 0,
    }));

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
        agentPerformance,
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
