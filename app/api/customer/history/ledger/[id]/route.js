import { connectDB } from "@/lib/db";
import AuditHistory from "@/models/admin/AuditHistory";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const proposalHistory = await AuditHistory.find({
      entityType: "Ledger",
      clientId: id,
    })
      .populate({ path: "changedBy", select: "username email" })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "History Success Fetched",
        data: proposalHistory,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
