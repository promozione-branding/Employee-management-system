import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const client = await EmployeeWorkDetail.find({ employeeId: id });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "client not found",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "client data",
        data: client,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: true,
        message: "server error",
      },
      { status: 500 },
    );
  }
}
