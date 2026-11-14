// app/api/customer/project-cycle/update-duration/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import ProjectCycle from "@/models/admin/ProjectCycle";

const ALLOWED_STATUS = ["in_build", "live", "completed"];
const ALLOWED_RENEWAL = ["3m", "6m", "12m", "custom"];

export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      projectCycleId,
      durationId,
      service,
      startDate,
      endDate,
      projectName,
      serviceType,
      proposalId,
      proposalNumber,
      category,
      categoryLabel,
      status,
      activatedAt,
      renewalDuration,
      renewalEndDate,
      resetRenewalMilestones,
    } = body;

    if (!projectCycleId || !durationId) {
      return NextResponse.json(
        {
          success: false,
          message: "projectCycleId and durationId are required",
        },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(projectCycleId) ||
      !mongoose.Types.ObjectId.isValid(durationId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ObjectId" },
        { status: 400 },
      );
    }

    // Enum guards — reject bad payloads
    if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }
    if (
      renewalDuration !== undefined &&
      renewalDuration !== null &&
      renewalDuration !== "" &&
      !ALLOWED_RENEWAL.includes(renewalDuration)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid renewalDuration" },
        { status: 400 },
      );
    }

    const updateFields = {};
    if (service) updateFields["projectDuration.$.service"] = service;
    if (startDate) updateFields["projectDuration.$.startDate"] = startDate;
    if (endDate) updateFields["projectDuration.$.endDate"] = endDate;
    if (projectName)
      updateFields["projectDuration.$.projectName"] = projectName;
    if (serviceType)
      updateFields["projectDuration.$.serviceType"] = serviceType;
    if (proposalId)
      updateFields["projectDuration.$.proposalId"] = proposalId;
    if (proposalNumber !== undefined)
      updateFields["projectDuration.$.proposalNumber"] = proposalNumber;
    if (category) updateFields["projectDuration.$.category"] = category;
    if (categoryLabel)
      updateFields["projectDuration.$.categoryLabel"] = categoryLabel;
    if (status) updateFields["projectDuration.$.status"] = status;
    if (activatedAt !== undefined)
      updateFields["projectDuration.$.activatedAt"] = activatedAt;
    if (renewalDuration !== undefined)
      updateFields["projectDuration.$.renewalDuration"] = renewalDuration;
    if (renewalEndDate !== undefined)
      updateFields["projectDuration.$.renewalEndDate"] = renewalEndDate;

    if (Object.keys(updateFields).length === 0 && !resetRenewalMilestones) {
      return NextResponse.json(
        { success: false, message: "No fields provided to update" },
        { status: 400 },
      );
    }

    const update = { $set: updateFields };
    if (resetRenewalMilestones) {
      update.$set["projectDuration.$.renewal.sentMilestones"] = [];
      update.$set["projectDuration.$.renewal.lastReminderAt"] = null;
    }

    const updatedProject = await ProjectCycle.findOneAndUpdate(
      {
        _id: projectCycleId,
        "projectDuration._id": durationId,
      },
      update,
      { new: true },
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project cycle or duration not found" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}
