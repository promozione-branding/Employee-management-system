// app/api/reports/seo/[customerId]/route.js
import { requireReportAdmin } from "@/lib/reportingAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function GET(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  
  const { customerId } = await params;

  try {
    await connectDB();
    
    // 1. Get the SEO Sheet (with keywords populated)
    const sheet = await SeoSheet.findOne({ clientId: customerId })
      .populate({ path: "keywords", model: Keyword })
      .lean();
    
    // 2. Get the Project Cycles (which contain the actual website names)
    const projectCycles = await ProjectCycle.find({ clientId: customerId }).lean();

    if (!sheet) {
      return NextResponse.json({ error: "No SEO sheet found for this customer." }, { status: 404 });
    }

    const groupedData = {};
    const allWebsites = new Set();

    // If we have Project Cycles, use the first project name as the fallback website
    let fallbackWebsite = "Website";
    if (projectCycles.length > 0 && projectCycles[0].projectDuration?.length > 0) {
      fallbackWebsite = projectCycles[0].projectDuration[0].projectName;
    }

    (sheet.keywords || []).forEach(kw => {
      let projectName = fallbackWebsite;

      // Try to find the exact project name if projectId exists
      if (kw.projectId) {
        const matchingCycle = projectCycles.find(pc => pc._id.toString() === kw.projectId.toString());
        if (matchingCycle && matchingCycle.projectDuration?.length > 0) {
          projectName = matchingCycle.projectDuration[0].projectName;
        }
      }

      allWebsites.add(projectName);

      if (!groupedData[projectName]) {
        groupedData[projectName] = [];
      }

      // Get the most recent ranking
      const sortedRankings = (kw.rankings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestRank = sortedRankings.length > 0 ? sortedRankings[0] : null;

      groupedData[projectName].push({
        keyword: kw.keyword,
        page: latestRank ? latestRank.page : "-",
        position: latestRank ? latestRank.position : "-",
      });
    });

    return NextResponse.json({ 
      seoData: groupedData,
      websites: Array.from(allWebsites)
    });

  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
