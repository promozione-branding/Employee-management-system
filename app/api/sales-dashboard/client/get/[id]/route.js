import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const isPaid = searchParams.get("isPaid");

    const filter = {
      salesExecutive: id,
    };

    if (search.trim()) {
      const or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { GSTIN: { $regex: search, $options: "i" } },
      ];

      // Only search phone if the input is numeric
      if (!isNaN(search)) {
        or.push({ phone: Number(search) });
      }

      filter.$or = or;
    }

    if (isPaid !== null) {
      filter.isPaid = isPaid === "true";
    }

    const total = await Customer.countDocuments(filter);

    const customers = await Customer.find(filter)
      .select("name company phone GSTIN Address isPaid")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}