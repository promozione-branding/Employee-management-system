import { connectDB } from "@/lib/db";
import ProjectCycle from "@/models/ProjectCycle";
import { NextResponse } from "next/server";
import Customer from "@/models/Customer"; 

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { clientId, service, serviceName } = body;
    const startDate = body.startDate || body["start-date"] || undefined;
    const endDate = body.endDate || body["end-date"] || undefined;

    if (!clientId) {
      return NextResponse.json({
        success: false,
        message: "Client ID is required",
      });
    }

    const finalService = service === "other" ? serviceName : service;

    let projectCycle = await ProjectCycle.findOne({ clientId });

    const newProject = {
      service: finalService,
      startDate,
      endDate,
    };

    if (projectCycle) {
      projectCycle.projectDuration.push(newProject);
      await projectCycle.save();
    } else {
      projectCycle = await ProjectCycle.create({
        clientId,
        projectDuration: [newProject],
      });
      await Customer.findByIdAndUpdate(clientId, {
        projectCycle: projectCycle._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Project added successfully",
      data: projectCycle,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
