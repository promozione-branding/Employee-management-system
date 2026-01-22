import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      employeeId,
      clientId,
      department,
      checklist = [],
      status = "IN_PROGRESS",
      progressPercentage = 0,
      startedAt,
    } = body;

    if (!employeeId || !clientId || !department) {
      return NextResponse.json(
        {
          success: false,
          message: "employeeId, clientId and department are required",
        },
        { status: 400 },
      );
    }

    const employeeIds = Array.isArray(employeeId) ? employeeId : [employeeId];

    // 🔒 DUPLICATE CHECK
    const alreadyAssigned = await EmployeeWorkDetail.findOne({
      clientId,
      employeeId: { $in: employeeIds },
    }).select("_id employeeId clientId");

    if (alreadyAssigned) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This client is already assigned to one of the selected employees",
        },
        { status: 409 }, // Conflict
      );
    }

    // ✅ Create work detail
    const workDetail = await EmployeeWorkDetail.create({
      employeeId: employeeIds,
      clientId,
      department,
      checklist,
      status,
      progressPercentage,
      startedAt,
    });

    // ✅ Sync to Employee
    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { workDetails: workDetail._id } }, // safer than $push
    );

    await Customer.findByIdAndUpdate(clientId, {
      $addToSet: { workDetails: workDetail._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee work detail created successfully",
        data: workDetail,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create EmployeeWorkDetail Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
