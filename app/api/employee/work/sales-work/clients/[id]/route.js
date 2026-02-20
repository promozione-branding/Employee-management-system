import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const client = await Customer.find({ salesExecutive: id })
      .select("_id name company email phone website createdAt")
      .sort({
        createdAt: -1,
      });

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
