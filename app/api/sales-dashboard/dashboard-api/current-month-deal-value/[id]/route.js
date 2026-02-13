import { NextResponse } from "next/server";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const result = await SalesEmployee.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(id),
        },
      },

      // proposals array → documents
      { $unwind: "$proposals" },

      // join proposal collection
      {
        $lookup: {
          from: "proposals",
          localField: "proposals",
          foreignField: "_id",
          as: "proposal",
        },
      },

      { $unwind: "$proposal" },

      // filter current month proposals
      {
        $match: {
          "proposal.createdAt": {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },

      // calculate final amount (2% deduction if tanNo exists)
      {
        $addFields: {
          finalAmount: {
            $cond: [
              {
                $and: [
                  { $ne: ["$proposal.tanNo", null] },
                  { $ne: ["$proposal.tanNo", ""] },
                ],
              },
              {
                $multiply: ["$proposal.totalAmount", 0.98], // minus 2%
              },
              "$proposal.totalAmount",
            ],
          },
        },
      },

      // total deal value
      {
        $group: {
          _id: null,
          totalDealValue: { $sum: "$finalAmount" },
        },
      },
    ]);

    const totalDealValue = result[0]?.totalDealValue || 0;

    return NextResponse.json(
      {
        success: true,
        message: "Current month deal value",
        totalDealValue,
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
