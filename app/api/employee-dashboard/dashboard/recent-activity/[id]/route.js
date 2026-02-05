import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const recentActive = await Employee.findById(id)
      .select("workDetails")
      .populate({
        path: "workDetails",
        select: "checklist createdAt",
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .lean(); // 👈 important

    if (!recentActive) {
      return NextResponse.json(
        { success: false, message: "No recent activity found" },
        { status: 404 }
      );
    }

    // 🔥 Slice checklist to last 5 items
    recentActive.workDetails = recentActive.workDetails.map((wd) => ({
      ...wd,
      checklist: wd.checklist
        ?.sort(
          (a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
        )
        .slice(0, 5),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Recent activity",
        data: recentActive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}


