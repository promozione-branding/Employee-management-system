// app/api/calling/history/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import Employee from "@/models/employee/Employee";

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
    const customerId = searchParams.get("customerId");
    const scope = searchParams.get("scope") || "self";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      200,
    );

    const query = {};
    if (customerId) query.customerId = customerId;

    // For "self" scope, filter by the Employee._id of the logged-in user
    if (scope === "self") {
      const emp = await Employee.findOne({ user: user._id })
        .select("_id")
        .lean();
      if (emp?._id) {
        query.agentErpUserId = emp._id;
      } else {
        // employee not found, return empty
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const calls = await CallLog.find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: calls });
  } catch (err) {
    console.error("[/api/calling/history]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}