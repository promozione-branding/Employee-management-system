import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const employeeWork = await EmployeeWorkDetail.find({ employeeId: id })
      .select("clientId")
      .populate({ path: "clientId", select: "_id name company website email" })
      .lean();

    return NextResponse.json(
      {
        data: employeeWork,
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
