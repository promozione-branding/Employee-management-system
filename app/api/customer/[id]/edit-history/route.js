// app/api/customer/[id]/edit-history/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import EditHistory from "@/models/admin/EditHistory";
import { connectDB as dbConnect } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id: customerId } = await params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get("module");
    const actionFilter = searchParams.get("action");
    const roleFilter = searchParams.get("role");
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "30", 10));

    const filter = {
      clientId: customerId,
      isConfidential: { $ne: true },
    };

    if (moduleFilter && moduleFilter !== "all") filter.module = moduleFilter;
    if (actionFilter && actionFilter !== "all") filter.action = actionFilter;
    if (roleFilter && roleFilter !== "all") filter.performedByRole = roleFilter;
    if (q) {
      filter.$or = [
        { summary: { $regex: q, $options: "i" } },
        { performedByName: { $regex: q, $options: "i" } },
        { performedByEmail: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      EditHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EditHistory.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[edit-history] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
