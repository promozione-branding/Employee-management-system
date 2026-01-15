import { connectDB } from "@/lib/db";
import AuditHistory from "@/models/admin/AuditHistory";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const deleteClientHistory = await AuditHistory.find({
      entityType: "Customer",
      action: "DELETE",
    }).populate("changedBy", "name email");

    if (!deleteClientHistory) {
      return NextResponse.json({
        success: false,
        message: "error while founding delete customer",
      });
    }

    return NextResponse.json({
      success: true,
      message: "delete customer fetched successfully",
      data: deleteClientHistory,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "server error",
    });
  }
}
