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

    // --- find call log + verify access ---
    const log = await CallLog.findOne({ myoperatorCallId: callId })
      .select("_id agentErpUserId recordingUrl referenceId")
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
    // Call MyOperator (confirmed working endpoint)
    // ------------------------------------------------------------
    const mpRes = await fetch(
      "https://developers.myoperator.co/search/recordings/link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, file: recordingFile }),
      },
    );

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

    // ------------------------------------------------------------
    // Find the matching hit
    // ------------------------------------------------------------
    const hits = mpData?.data?.hits || [];

    // Priority order:
    // 1. Match by filename (exact)
    // 2. Match by _cri (our referenceId)
    // 3. Match by _ri (myoperatorCallId)
    // 4. Fall back to first hit
    const match =
      hits.find((h) => h?._source?.filename === recordingFile) ||
      hits.find((h) => h?._source?._cri === log.referenceId) ||
      hits.find((h) => h?._source?._ri === callId) ||
      hits[0];

    if (!match) {
      console.warn("[recording] no hits in response");
      return NextResponse.json(
        { success: false, message: "Recording not found" },
        { status: 404 },
      );
    }

    const src = match?._source || match;

    // ------------------------------------------------------------
    // Extract the file URL
    // Confirmed field: _source.fileurl
    // ------------------------------------------------------------
    let link =
      src?.fileurl ||
      src?.file_url ||
      src?.fileUrl ||
      src?.link ||
      src?.url ||
      src?.recording_url ||
      null;

    if (!link) {
      console.warn(
        "[recording] no fileurl found. Available keys:",
        Object.keys(src || {}),
      );
      return NextResponse.json(
        { success: false, message: "Recording URL missing in response" },
        { status: 404 },
      );
    }

    // Append extension if missing — MyOperator's fileurl has no .mp3
    const filename = src?.filename || recordingFile;
    if (!/\.(mp3|wav|ogg|m4a)(\?|$)/i.test(link)) {
      if (filename && /\.(mp3|wav|ogg|m4a)$/i.test(filename)) {
        link = `${link}.mp3`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        url: link,
        callId,
        file: filename,
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