import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const ledgerDetails = await Customer.findById(id)
      .select("ledger")
      .populate({
        path: "ledger",
      });

    if (!ledgerDetails) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer ledger fetched successfully",
      data: ledgerDetails,
    });
  } catch (error) {
    console.error("Error fetching customer ledger:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching the ledger",
      },
      { status: 500 }
    );
  }
}
