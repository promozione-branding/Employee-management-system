import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // customer | proposal

    const customer = await Customer.findById(id).populate({
      path: "history",
      match: type
        ? { entityType: type.charAt(0).toUpperCase() + type.slice(1) }
        : {},
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "changedBy",
        select: "username email role",
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer history fetched successfully",
        data: customer.history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CUSTOMER HISTORY API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
