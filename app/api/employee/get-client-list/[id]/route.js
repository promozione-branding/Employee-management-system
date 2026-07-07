import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer"

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    console.log(id, "lklkl")

    const employee = await Employee.findById(id)
      .populate({
        path: "workDetails",
        populate: {
          path: "clientId",
          select: "name company website updatedAt",
        },
      });

    const uniqueClients = [];

    const map = new Map();

    employee.workDetails.forEach((work) => {
      const client = work.clientId;
      if (!client) return;
      if (!map.has(client?._id.toString())) {
        map.set(client?._id.toString(), client);
      }
    });

    return NextResponse.json({
      success: true,
      data: [...map.values()],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error", error },
      { status: 500 },
    );
  }
}
