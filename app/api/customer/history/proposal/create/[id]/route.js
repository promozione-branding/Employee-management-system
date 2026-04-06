import { connectDB } from "@/lib/db";
import AuditLog from "@/models/admin/AuditHistory";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // 🔍 FETCH HISTORY FOR THIS PROPOSAL
    const history = await AuditLog.find({
      entityType: "Proposal",
      clientId: id,
    })
      .select("-changes")
      .sort({ createdAt: -1 })
      .populate({ path: "changedBy", select: "username" }); 

    return NextResponse.json({
      success: true,
      message: "Proposal history fetched successfully",
      data: history,
    });
  } catch (error) {
    console.error("GET PROPOSAL HISTORY ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
