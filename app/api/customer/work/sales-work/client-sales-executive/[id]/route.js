import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import Employee from "@/models/employee/Employee";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const salesEmployee = await Customer.findById(id)
      .select("salesExecutive")
      .populate({ path: "salesExecutive", select: "_id basicDetails.name" });

    if (!salesEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no client found",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: salesEmployee,
        success: true,
        message: "Success",
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
