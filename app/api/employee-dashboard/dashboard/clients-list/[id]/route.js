import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Customer from "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const clients = await Employee.findById(id)
      .select("workDetails")
      .populate({
        path: "workDetails",
        select: "clientId progressPercentage status",
        populate: {
          path: "clientId",
          select: "name email company",
        },
      });

    if (!clients || clients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No clients found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Clients list",
        data: clients,
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
      { status: 500 },
    );
  }
}
