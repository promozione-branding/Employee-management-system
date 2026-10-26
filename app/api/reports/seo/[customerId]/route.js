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
    
    const projectCycles = await ProjectCycle.find({ clientId: customerId }).lean();
    const websitesList = [];
    
    projectCycles.forEach(pc => {
      if (pc.projectDuration && Array.isArray(pc.projectDuration)) {
        pc.projectDuration.forEach(pd => {
          if (pd.projectName) {
            // Clean the name: remove "Website - ", "https://", "www.", and trailing slashes
            let cleanName = pd.projectName
              .replace(/^Website\s*[-:]\s*/i, "")
              .replace(/^https?:\/\//i, "")
              .replace(/^www\./i, "")
              .replace(/\/$/, "")
              .trim()
              .toLowerCase();
            websitesList.push(cleanName);
          }
        });
      }
    });
    const uniqueWebsites = [...new Set(websitesList)];

    const sheet = await SeoSheet.findOne({ clientId: customerId })
      .populate({ path: "keywords", model: Keyword })
      .lean();
    
    if (!sheet) return NextResponse.json({ error: "No SEO sheet found." }, { status: 404 });

    const allKeywords = sheet.keywords || [];
    const groupedData = {};
    
    if (uniqueWebsites.length > 0) {
      const chunkSize = Math.ceil(allKeywords.length / uniqueWebsites.length);
      
      uniqueWebsites.forEach((site, index) => {
        const start = index * chunkSize;
        const end = start + chunkSize;
        const siteKeywords = allKeywords.slice(start, end);
        
        groupedData[site] = siteKeywords.map(kw => {
          const sortedRankings = (kw.rankings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          const latestRank = sortedRankings.length > 0 ? sortedRankings[0] : null;
          return {
            keyword: kw.keyword,
            page: latestRank ? latestRank.page : "-",
            position: latestRank ? latestRank.position : "-",
          };
        });
      });
    } else {
      groupedData["unknown"] = allKeywords.map(kw => {
        const sortedRankings = (kw.rankings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestRank = sortedRankings.length > 0 ? sortedRankings[0] : null;
        return {
          keyword: kw.keyword,
          page: latestRank ? latestRank.page : "-",
          position: latestRank ? latestRank.position : "-",
        };
      });
    }

    return NextResponse.json({ 
      seoData: groupedData,
      websites: uniqueWebsites
    });

  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
