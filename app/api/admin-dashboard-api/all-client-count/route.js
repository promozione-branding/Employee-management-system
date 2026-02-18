import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const clientCount = await Customer.countDocuments();

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: clientCount,
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
