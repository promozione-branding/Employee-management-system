import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const allCustomer = await Customer.find({ salesExecutive: id })
      .select("name company phone GSTIN Address isPaid")
      .sort({ createdAt: -1 });


    if (!allCustomer) {
      return NextResponse.json({
        success: false,
        message: "cant find customer",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Get all Customer by sales",
        data: allCustomer,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("get all api error");
    return NextResponse.json(
      {
        success: false,
        message: "server error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
