import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const { salesExecutive } = body;

    if (!salesExecutive) {
      return NextResponse.json(
        { success: false, message: "Sales executive is required" },
        { status: 400 },
      );
    }

    await Customer.findByIdAndUpdate(id, { salesExecutive }, { new: true });

    return NextResponse.json(
      {
        success: true,
        message: "Sales executive updated successfully",
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
