import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import Proposal from "@/models/admin/proposal/Proposal";
import Service from "@/models/admin/proposal/Service";

export async function GET(req) {
  try {
    await connectDB();

    const client = await Customer.find()
      .select("name company email salesExecutive proposals")
      .populate({
        path: "proposals",
        select: "services",
        populate: { path: "services", select: "serviceTitle" },
      })
      .sort({ createdAt: -1 })
      .limit(7)
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: client,
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
