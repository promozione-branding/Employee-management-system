import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import Employee from "@/models/employee/Employee";
import Customer from "@/models/admin/Customer";
import ProjectCycle from "@/models/admin/ProjectCycle";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      employeeId,
      clientId,
      projectId,
      department,
      checklist = [],
      status = "IN_PROGRESS",
      progressPercentage,
      startedAt,
    } = body;

    if (!employeeId || !clientId || !projectId || !department) {
      return NextResponse.json(
        {
          success: false,
          message:
            "employeeId, clientId, projectId and department are required",
        },
        { status: 400 }
      );
    }

    const employeeIds = Array.isArray(employeeId)
      ? employeeId
      : [employeeId];

    // ==========================================
    // CHECK IF THIS PROJECT ALREADY EXISTS
    // ==========================================
    let workDetail = await EmployeeWorkDetail.findOne({
      clientId,
      projectId,
      department,
    });

    // ==========================================
    // UPDATE EXISTING PROJECT
    // ==========================================
    if (workDetail) {
      const oldData = workDetail.toObject();

      await EmployeeWorkDetail.updateOne(
        {
          _id: workDetail._id,
        },
        {
          $addToSet: {
            employeeId: {
              $each: employeeIds,
            },
          },
        }
      );

      await Employee.updateMany(
        {
          _id: {
            $in: employeeIds,
          },
        },
        {
          $addToSet: {
            workDetails: workDetail._id,
          },
        }
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

      const auditLog = await createAuditLog({
        clientId,
        entityType: "EmployeeWorkDetail",
        entityId: workDetail._id,
        action: "UPDATE",
        oldData,
        newData: updatedWorkDetail.toObject(),
        userId: authUser._id,
      });

      if (auditLog) {
        await Customer.findByIdAndUpdate(clientId, {
          $push: {
            history: auditLog._id,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Employee assigned successfully.",
          data: updatedWorkDetail,
        },
        {
          status: 200,
        }
      );
    }

    // ==========================================
    // UPDATE PROJECT CYCLE
    // ==========================================
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

    // ==========================================
    // CREATE NEW PROJECT WORK DETAIL
    // ==========================================
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

    // ==========================================
    // UPDATE EMPLOYEE
    // ==========================================
    await Employee.updateMany(
      {
        _id: {
          $in: employeeIds,
        },
      },
      {
        $addToSet: {
          workDetails: workDetail._id,
        },
      }
    );

    // ==========================================
    // UPDATE CUSTOMER
    // ==========================================
    await Customer.findByIdAndUpdate(clientId, {
      $addToSet: {
        workDetails: workDetail._id,
      },
    });

    // ==========================================
    // AUDIT LOG
    // ==========================================
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
        $push: {
          history: auditLog._id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project assigned successfully.",
        data: workDetail,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create EmployeeWorkDetail Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}