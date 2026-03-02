import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const result = await Proposal.aggregate([
      {
        $match: {
          ledgerEntry: true,
          createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const revenue = result[0]?.revenue || 0;

    return NextResponse.json(
      {
        success: true,
        message: "Success current month deal value",
        revenue,
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
