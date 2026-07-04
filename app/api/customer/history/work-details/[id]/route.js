import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import ProjectCycle from "@/models/admin/ProjectCycle";
import { NextResponse } from "next/server";

import "@/models/employee/Employee";
import "@/models/employee/EmployeeWorkDetail";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const customer = await Customer.findById(id)
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
            select: "basicDetails.name employeeId",
          },
        ],
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no customer with this id",
        },
        { status: 404 }
      );
    }

    const workDetails = await Promise.all(
      customer.workDetails.map(async (work) => {
        const cycle = await ProjectCycle.findOne(
          {
            clientId: id,
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

        return {
          ...work.toObject(),

          project: project
            ? {
              _id: project._id,
              projectName: project.projectName,
              service: project.service,
              startDate: project.startDate,
              endDate: project.endDate,
            }
            : null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Client work details history",
        data: { workDetails: workDetails },
      },
      { status: 200, }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Server error", },
      { status: 500, }
    );
  }
}