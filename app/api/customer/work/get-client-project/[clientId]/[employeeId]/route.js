import { NextResponse } from "next/server";
import mongoose from "mongoose";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import ProjectCycle from "@/models/admin/ProjectCycle";
import "@/models/employee/Employee";
import "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    const { clientId, employeeId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid clientId or employeeId",
        },
        { status: 400 }
      );
    }

    // Get all work assigned to this employee for this client
    const workDetails = await EmployeeWorkDetail.find({
      clientId,
      employeeId: employeeId,
    })
      .populate({
        path: "employeeId",
        select: "_id basicDetails.name",
      })
      .populate({
        path: "clientId",
        select: "_id name company website",
      })
      .populate({
        path: "checklist.completedBy",
        select: "_id basicDetails.name basicDetails.profileImage employeeId",
      });;

    const result = [];

    for (const work of workDetails) {
      // Find project containing this embedded project id
      const cycle = await ProjectCycle.findOne(
        {
          clientId,
          "projectDuration._id": work.projectId,
        },
        {
          projectDuration: {
            $elemMatch: {
              _id: work.projectId,
            },
          },
        }
      );

      const project = cycle?.projectDuration?.[0];

      result.push({
        workDetailId: work._id,

        client: work.clientId,

        project: {
          _id: project?._id,
          projectName: project?.projectName,
          service: project?.service,
          startDate: project?.startDate,
          endDate: project?.endDate,
        },
        checklist: work.checklist,
        department: work.department,

        status: work.status,

        progressPercentage: work.progressPercentage,

        checklistCount: work.checklist.length,

        employees: work.employeeId.map((emp) => ({
          _id: emp._id,
          name: emp.basicDetails?.name,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch assigned projects",
      },
      {
        status: 500,
      }
    );
  }
}