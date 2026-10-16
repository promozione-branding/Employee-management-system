// app/api/calling/client/[customerId]/route.js

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

    const { customerId } = await params;

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "all";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100", 10),
      500,
    );

    const query = {
      customerId: new mongoose.Types.ObjectId(customerId),
    };

    // scope=self filters to the logged-in salesperson (via Employee link)
    if (scope === "self") {
      const Employee = (await import("@/models/employee/Employee")).default;
      const emp = await Employee.findOne({ user: user._id })
        .select("_id")
        .lean();
      if (!emp?._id) {
        return NextResponse.json({ success: true, data: [] });
      }
      query.agentErpUserId = emp._id;
    }

    const logs = await CallLog.find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[/api/calling/client]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
