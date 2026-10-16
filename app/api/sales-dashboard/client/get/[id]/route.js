
 // app/api/sales-dashboard/client/get/[id]/route.js

import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate sales executive ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sales executive ID",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page"), 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit"), 10) || 20
      )
    );

    const search = (searchParams.get("search") || "").trim();
    const isPaid = searchParams.get("isPaid");

    // Show clients assigned to this sales executive.
    const filter = {
      salesExecutive: id,
    };

    // Search by name, company, GSTIN, or phone.
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { GSTIN: { $regex: search, $options: "i" } },
      ];

      // Search phone only when the search value is numeric.
      if (/^\d+$/.test(search)) {
        searchConditions.push({
          phone: Number(search),
        });
      }

      filter.$or = searchConditions;
    }

    // Filter only when Paid is explicitly enabled.
    // Otherwise, show both paid and unpaid clients.
    if (isPaid === "true") {
      filter.isPaid = true;
    }

    const total = await Customer.countDocuments(filter);

    const customers = await Customer.find(filter)
      .select("name company phone GSTIN Address isPaid salesExecutive")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
      },
      { status: 500 }
    );
  }
}
