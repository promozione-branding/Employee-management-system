// app/api/calling/admin/agents/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
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

    const allowed = ["admin", "ADMIN", "manager", "MANAGER", "SR_MANAGER"];
    if (!allowed.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const agents = await Employee.find(
      {
        "basicDetails.resignedEmployee": { $ne: true },
      },
      {
        "basicDetails.name": 1,
        "basicDetails.email": 1,
        "basicDetails.designation": 1,
        myoperatorUserId: 1,
        myoperatorName: 1,
      },
    )
      .sort({ "basicDetails.name": 1 })
      .lean();

    const data = agents.map((a) => ({
      _id: a._id,
      name: a.basicDetails?.name || "Unknown",
      email: a.basicDetails?.email || "",
      designation: a.basicDetails?.designation || "",
      hasMyopId: Boolean(a.myoperatorUserId),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/calling/admin/agents]", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
