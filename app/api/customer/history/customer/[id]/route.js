import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const customer = await Customer.findById(id).populate({
      path: "history",
      populate: {
        path: "changedBy",
        select: "username email role",
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "customer history fetched successfully",
        data: customer.history,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 }
    );
  }
}
