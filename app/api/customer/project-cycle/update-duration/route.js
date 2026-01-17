import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { projectCycleId, durationId, service, startDate, endDate } = body;

    // ---- validations ----
    if (!projectCycleId || !durationId) {
      return NextResponse.json(
        {
          success: false,
          message: "projectCycleId and durationId are required",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(projectCycleId) ||
      !mongoose.Types.ObjectId.isValid(durationId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ObjectId" },
        { status: 400 }
      );
    }

    // ---- build update object dynamically ----
    const updateFields = {};
    if (service) updateFields["projectDuration.$.service"] = service;
    if (startDate) updateFields["projectDuration.$.startDate"] = startDate;
    if (endDate) updateFields["projectDuration.$.endDate"] = endDate;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields provided to update" },
        { status: 400 }
      );
    }

    // ---- update subdocument ----
    const updatedProject = await ProjectCycle.findOneAndUpdate(
      {
        _id: projectCycleId,
        "projectDuration._id": durationId,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
      }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project cycle or duration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project duration updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Duration Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
