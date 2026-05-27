import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Employee from "@/models/employee/Employee";
import Customer from "@/models/admin/Customer";;
import { NextResponse } from "next/server";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      employeeId,
      projectId,
      clientId,
      department,
      checklist = [],
      status = "IN_PROGRESS",
      progressPercentage,
      startedAt,
    } = body;

    if (!employeeId || !clientId || !department || !projectId) {
      return NextResponse.json(
        {
          success: false,
          message: "employeeId, clientId and department are required",
        },
        { status: 400 }
      );
    }

    const employeeIds = Array.isArray(employeeId) ? employeeId : [employeeId];

    // 🔎 Check if work detail already exists
    let workDetail = await EmployeeWorkDetail.findOne({
      clientId,
      department,
    });

    // 🧠 CASE 1: UPDATE (Assign employee to existing work detail)
    if (workDetail) {
      const oldData = workDetail.toObject();

      await EmployeeWorkDetail.updateOne(
        { _id: workDetail._id },
        { $addToSet: { employeeId: { $each: employeeIds } } }
      );

      await Employee.updateMany(
        { _id: { $in: employeeIds } },
        { $addToSet: { workDetails: workDetail._id } }
      );

      await ProjectCycle.updateOne(
        {
          "projectDuration._id": projectId,
        },
        {
          $addToSet: {
            "projectDuration.$.employeeId": {
              $each: employeeIds,
            },
          },
        }
      );

      const updatedWorkDetail = await EmployeeWorkDetail.findById(
        workDetail._id
      );

      // 🧾 CREATE AUDIT HISTORY
      const auditLog = await createAuditLog({
        clientId,
        entityType: "EmployeeWorkDetail",
        entityId: workDetail._id,
        action: "UPDATE",
        oldData,
        newData: updatedWorkDetail.toObject(),
        userId: authUser._id,
      });

      // 🔗 Attach history to customer
      if (auditLog) {
        await Customer.findByIdAndUpdate(clientId, {
          $push: { history: auditLog._id },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Employee assigned to existing work detail",
          data: updatedWorkDetail,
        },
        { status: 200 }
      );
    }

    await ProjectCycle.updateOne(
      {
        "projectDuration._id": projectId,
      },
      {
        $addToSet: {
          "projectDuration.$.employeeId": {
            $each: employeeIds,
          },
        },
      }
    );

    // 🆕 CASE 2: CREATE NEW WORK DETAIL
    workDetail = await EmployeeWorkDetail.create({
      employeeId: employeeIds,
      clientId,
      projectId,
      department,
      checklist,
      status,
      progressPercentage,
      startedAt,
    });

    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { workDetails: workDetail._id } }
    );

    await Customer.findByIdAndUpdate(clientId, {
      $addToSet: { workDetails: workDetail._id },
    });

    // 🧾 CREATE AUDIT HISTORY
    const auditLog = await createAuditLog({
      clientId,
      entityType: "EmployeeWorkDetail",
      entityId: workDetail._id,
      action: "CREATE",
      oldData: null,
      newData: workDetail.toObject(),
      userId: authUser._id,
    });

    if (auditLog) {
      await Customer.findByIdAndUpdate(clientId, {
        $push: { history: auditLog._id },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee work detail created successfully",
        data: workDetail,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create EmployeeWorkDetail Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
