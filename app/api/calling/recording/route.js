// app/api/calling/recording/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import Employee from "@/models/employee/Employee";

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

    const { searchParams } = new URL(req.url);
    const callId = searchParams.get("callId");

    if (!callId) {
      return NextResponse.json(
        { success: false, message: "callId param required" },
        { status: 400 },
      );
    }

    // --- find call + permission check ---
    const log = await CallLog.findOne({ myoperatorCallId: callId })
      .select("_id agentErpUserId recordingUrl")
      .lean();

    if (!log) {
      return NextResponse.json(
        { success: false, message: "Call record not found" },
        { status: 404 },
      );
    }

    const emp = await Employee.findOne({ user: user._id })
      .select("_id")
      .lean();

    const isAdmin = ["ADMIN", "MANAGER", "SR_MANAGER"].includes(user.role);

    if (
      !isAdmin &&
      emp &&
      log.agentErpUserId &&
      String(log.agentErpUserId) !== String(emp._id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    // --- token check ---
    const token = process.env.MYOP_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "API token not configured" },
        { status: 500 },
      );
    }

    const recordingFile = log.recordingUrl || "";
    if (!recordingFile) {
      return NextResponse.json(
        { success: false, message: "No recording file for this call" },
        { status: 404 },
      );
    }

    // ------------------------------------------------------------
    // Confirmed working endpoint (per MyOperator dev):
    //   GET https://developers.myoperator.co/recordings/link
    //   Query params: token, file
    //   Response: { status:"success", code:200, url:"<S3 URL>" }
    // ------------------------------------------------------------
    const url = new URL("https://developers.myoperator.co/recordings/link");
    url.searchParams.set("token", token);
    url.searchParams.set("file", recordingFile);

    const mpRes = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const mpData = await mpRes.json().catch(() => ({}));

    if (!mpRes.ok || mpData?.status === "error") {
      console.warn("[recording] MyOperator error:", mpData);
      return NextResponse.json(
        {
          success: false,
          message: mpData?.message || "Failed to fetch recording link",
        },
        { status: mpRes.status || 500 },
      );
    }

    // Extract URL — confirmed at top-level `.url`
    const link =
      mpData?.url ||
      mpData?.data?.url ||
      mpData?.link ||
      mpData?.data?.link ||
      null;

    if (!link) {
      console.warn("[recording] no url in response:", mpData);
      return NextResponse.json(
        { success: false, message: "Recording link not available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: link,
        callId,
        file: recordingFile,
      },
    });
  } catch (err) {
    console.error("[/api/calling/recording]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}