import { connectDB } from "@/lib/db";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import ProjectCycle from "@/models/admin/ProjectCycle";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Get SEO sheet with employee populated
    const getSeoSheet = await SeoSheet.findOne({ clientId: id })
      .populate({
        path: "keywords",
        populate: {
          path: "rankings.employeeID",
          select: "basicDetails.name",
        },
      })
      .lean();

    if (!getSeoSheet) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no sheet found of client",
        },
        { status: 404 }
      );
    }

    // Get project cycle
    const projectCycle = await ProjectCycle.findOne({
      clientId: id,
    }).lean();

    // Attach matching project to each keyword
    const keywordsWithProjects = getSeoSheet.keywords.map((keyword) => {
      let matchedProject = null;

      if (projectCycle?.projectDuration?.length) {
        matchedProject =
          projectCycle.projectDuration.find(
            (project) =>
              project._id.toString() === keyword.projectId?.toString()
          ) || null;
      }

      return {
        ...keyword,
        project: matchedProject,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Success client seo sheet fetched",
        data: {
          ...getSeoSheet,
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