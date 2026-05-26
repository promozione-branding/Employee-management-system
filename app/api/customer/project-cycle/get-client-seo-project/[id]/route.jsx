import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Find project cycle for this customer
    const projectCycle = await ProjectCycle.findOne({
      clientId: id,
      "projectDuration.service": "seo",
    });

    if (!projectCycle) {
      return NextResponse.json(
        {
          success: false,
          message: "No SEO service project found",
        },
        { status: 404 }
      );
    }

    // Filter only seo services
    const seoProjects = projectCycle.projectDuration.filter(
      (project) => project.service === "seo"
    );

    return NextResponse.json(
      {
        success: true,
        message: "SEO projects fetched successfully",
        data: seoProjects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}