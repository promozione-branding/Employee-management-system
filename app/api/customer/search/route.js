import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q");
    const company = searchParams.get("company");
    const email = searchParams.get("email");
    const isPaidParam = searchParams.get("isPaid");

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    let filter = {};

    // 🔍 GLOBAL SEARCH
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { GSTIN: { $regex: q, $options: "i" } },
      ];
    }

    // 🎯 SPECIFIC FILTERS
    if (company) {
      filter.company = { $regex: company, $options: "i" };
    }

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    // 💰 isPaid FILTER
    if (isPaidParam !== null) {
      const isPaid =
        isPaidParam === "true" ||
        isPaidParam === "Paid" ||
        isPaidParam === "paid";

      filter.isPaid = isPaid;
    }

    const customers = await Customer.find(filter)
      .select("name company phone salesExecutive isPaid")
      .populate({
        path: "salesExecutive",
        select: "basicDetails.name",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}