import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import AuditHistory from "@/models/admin/AuditHistory";
import User from "@/models/admin/User";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 30;

    const skip = (page - 1) * limit;
    const { id } = await params;

    const customer = await Customer.findById(id).populate({
      path: "history",
      options: {
        sort: { createdAt: -1 },
      },
      populate: {
        path: "changedBy",
        select: "username email role",
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    const total = customer.history.length;

    const paginatedHistory = customer.history.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        message: "Customer history fetched successfully",
        data: paginatedHistory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
