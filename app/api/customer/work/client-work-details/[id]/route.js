import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const clientWork = await Customer.findById(id).select("workDetails company").populate("workDetails");

    if (!clientWork) {
      return NextResponse.json(
        {
          success: false,
          message: "client not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:"client work details",
        data:clientWork
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
