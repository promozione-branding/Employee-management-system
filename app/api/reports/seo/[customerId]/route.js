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
    
    // 1. Fetch the Project Cycles (which contain the exact Website Names)
    const projectCycles = await ProjectCycle.find({ clientId: customerId }).lean();
    
    // Extract all website names
    const websitesList = [];
    projectCycles.forEach(pc => {
      if (pc.projectDuration && Array.isArray(pc.projectDuration)) {
        pc.projectDuration.forEach(pd => {
          if (pd.projectName) websitesList.push(pd.projectName);
        });
      }
    });

    // 2. Fetch the SEO Sheet and its keywords
    const sheet = await SeoSheet.findOne({ clientId: customerId })
      .populate({ path: "keywords", model: Keyword })
      .lean();
    
    if (!sheet) {
      return NextResponse.json({ error: "No SEO sheet found for this customer." }, { status: 404 });
    }

    const groupedData = {};
    const allWebsites = new Set(websitesList);

    // If there are no websites in ProjectCycle, fall back to a default name
    let defaultSite = websitesList.length > 0 ? websitesList[0] : "Website";

    (sheet.keywords || []).forEach(kw => {
      // Since projectId is null in the DB, we attach all keywords to the default first website
      // Or, if you have logic to match them, you can place it here.
      let projectName = defaultSite;

      // Try to find a match if projectId exists in the future
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

    // Make sure all websites from ProjectCycle appear in the final list
    websitesList.forEach(site => {
      if (!groupedData[site]) groupedData[site] = [];
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
