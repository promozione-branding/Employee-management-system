import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const customer = await Customer.findById(id).populate({
      path: "ledger",
    });

    if (!customer) {
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
      data: customer.ledger, // ✅ return only ledger
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
