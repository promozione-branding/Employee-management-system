import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const work = await EmployeeWorkDetail.find({ employeeId: id })
    // .select(
    //   "checklist",
    // );

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: work,
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
