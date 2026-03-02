import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // ✅ UTC month boundaries (important)
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const revenue = await Proposal.aggregate([
      {
        $match: {
          ledgerEntry: true,
        },
      },

      // join customer
      {
        $lookup: {
          from: "customers",
          localField: "clientId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },

      // join ledger
      {
        $lookup: {
          from: "ledgers",
          localField: "customer.ledger",
          foreignField: "_id",
          as: "ledger",
        },
      },
      { $unwind: "$ledger" },

      // break entries array
      { $unwind: "$ledger.entries" },

      // filter current month entries
      {
        $match: {
          "ledger.entries.date": {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },

      // sum revenue (credits = money received)
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$ledger.entries.credit",
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Current month revenue",
      revenue: revenue[0]?.totalRevenue || 0,
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
