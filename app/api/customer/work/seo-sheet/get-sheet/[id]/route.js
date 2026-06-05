import { connectDB } from "@/lib/db";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import ProjectCycle from "@/models/admin/ProjectCycle";
import { NextResponse } from "next/server";
import Keyword from "@/models/employee/seoEmployee/Keyword";
export async function GET(req, { params }) {
  try {
    await connectDB();

    console.error("error");
    const { id } = await params;
    // Get seo sheet with keywords
    const getSeoSheet = await SeoSheet.findOne({ clientId: id, }).populate("keywords");

    if (!getSeoSheet) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no sheet found for this client",
        },
        { status: 404 }
      );
    }

    // Get all project cycles of this client
    const projectCycle = await ProjectCycle.findOne({
      clientId: id,
    });

    // Attach matching embedded project manually
    const keywordsWithProjects = getSeoSheet.keywords.map((keyword) => {
      let matchedProject = null;

      if (projectCycle) {
        matchedProject = projectCycle.projectDuration.find(
          (project) =>
            project._id.toString() === keyword.projectId?.toString()
        );
      }

      return {
        ...keyword.toObject(),
        project: matchedProject || null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Success client seo sheet fetched",
        data: {
          ...getSeoSheet.toObject(),
          keywords: keywordsWithProjects,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}