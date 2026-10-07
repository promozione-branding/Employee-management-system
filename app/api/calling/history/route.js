// app/api/calling/history/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";                 // 🔧 ADAPT ME
import { getServerSession } from "next-auth";            // 🔧 ADAPT ME
import CallLog from "@/models/employee/sales/CallLog";

export async function GET(req) {
  try {
    await dbConnect();

    const session = await getServerSession(); // 🔧 ADAPT ME
    const erpUserId =
      session?.user?._id || session?.user?.id;
    if (!erpUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const scope = searchParams.get("scope") || "self"; // "self" | "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

    const query = {};
    if (customerId) query.customerId = customerId;
    if (scope === "self") query.agentErpUserId = erpUserId;

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