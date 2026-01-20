import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer"

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const employee = await Employee.findById(id)
      .select("workDetails")
      .populate({
        path: "workDetails",
        select: "-checklist -__v", 
        populate: {
          path: "clientId",
          select: "name company website",
        },
      });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Get all work details",
        data: employee,
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
