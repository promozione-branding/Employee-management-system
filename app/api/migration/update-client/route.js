import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";

export async function GET(req) {
  try {
    await connectDB();

    console.log("⏳ Syncing indexes...");

    // ✅ Sync indexes
    const result = await Customer.updateMany(
      { isPaid: { $exists: false } },
      { $set: { isPaid: false } },
    );


    return NextResponse.json({
      success: true,
      message: "Indexes synced successfully",
      result,
    });
  } catch (error) {
    console.error("❌ Sync Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync indexes",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
