
import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/Proposal";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid salesExecutive id" },
        { status: 400 },
      );
    }

    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const proposal = await Proposal.find({
      salesExecutive: id,
      ledgerEntry: true,
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    })
      .select("totalAmount")
      .lean();

    const sum = proposal.reduce((acc, curr) => {
      return acc + curr.totalAmount;
    }, 0);

    return NextResponse.json({
      success: true,
      message: "Success current month deal value",
      data: sum,
    });
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
