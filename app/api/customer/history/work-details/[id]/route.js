import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import Employee from "@/models/employee/Employee";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const customerWorkDetailsHistory = await Customer.findById(id)
      .select("workDetails")
      .populate({
        path: "workDetails",
        populate: [
          {
            path: "employeeId",
            select: "basicDetails.name basicDetails.designation",
          },
          {
            path: "checklist.completedBy",
            select: "basicDetails.name",
          },
        ],
      });

    if (!customerWorkDetailsHistory) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no customer of this id",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Client work details history",
        data: customerWorkDetailsHistory,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
