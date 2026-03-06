import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { getAuthUser } from "@/lib/getAuthUser";
import { createAuditLog } from "@/utils/createAuditLog";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const data = await req.json();

    // 🔎 FIND EMPLOYEE
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 },
      );
    }

    // 📌 STORE OLD DATA
    const oldBasicDetails = employee.basicDetails.toObject();

    // 📝 UPDATE BASIC DETAILS
    employee.basicDetails = {
      ...employee.basicDetails.toObject(),
      ...data,
    };

    await employee.save();

    // 🧾 CREATE AUDIT HISTORY
    await createAuditLog({
      clientId: employee._id, // using employee as entity
      entityType: "Employee",
      entityId: employee._id,
      action: "UPDATE",
      oldData: oldBasicDetails,
      newData: employee.basicDetails.toObject(),
      userId: authUser._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee basic details updated successfully",
        data: employee,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
