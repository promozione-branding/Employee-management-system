export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import ReportClient from "@/models/admin/ReportClient";
import Report from "@/models/admin/Report";
import { requireReportAdmin } from "@/lib/reportingAuth";
import mongoose from "mongoose";

export const maxDuration = 60;

function resolvePeriod(type, customStart, customEnd) {
  const now = new Date();
  
  // 👈 Initialize as let
  let start;
  let end;

  if (type === "custom") {
    start = new Date(customStart);
    end = new Date(customEnd);
  } else {
    end = new Date(now);
    start = new Date(now);
    if (type === "weekly") start.setDate(start.getDate() - 7);
    else if (type === "monthly") start.setMonth(start.getMonth() - 1);
    else if (type === "3month") start.setMonth(start.getMonth() - 3);
    else if (type === "6month") start.setMonth(start.getMonth() - 6);
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - diffDays);

  return { 
    start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10),
    prevStart: prevStart.toISOString().slice(0, 10), prevEnd: prevEnd.toISOString().slice(0, 10)
  };
}

async function fetchAll(arr, fn) {
  const out = [];
  for (const item of arr || []) {
    try { out.push({ id: item, data: await fn(item) }); }
    catch (e) { out.push({ id: item, error: e.message }); }
  }
  return out;
}

export async function POST(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Bad id" }, { status: 400 });

  await connectDB();
  const body = await req.json();
  const { start, end, prevStart, prevEnd } = resolvePeriod(body.periodType, body.start, body.end);

  const client = await ReportClient.findById(id).lean();
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const { getGA4, getGSC, getGoogleAds } = await import("@/lib/google");
  const { getMetaAds, getMetaPage } = await import("@/lib/meta");

  let seoKeywords = [];
  if (client.customerId) {
    try {
      const SeoSheet = (await import("@/models/employee/seoEmployee/SeoSheet")).default; 
      const Keyword = (await import("@/models/employee/seoEmployee/Keyword")).default; 
      const ProjectCycle = (await import("@/models/admin/ProjectCycle")).default;
      
      const sheet = await SeoSheet.findOne({ clientId: client.customerId }).populate({ path: "keywords", model: Keyword }).lean();
      const projectCycles = await ProjectCycle.find({ clientId: client.customerId }).lean();
      
      if (sheet && sheet.keywords) {
        seoKeywords = sheet.keywords.map(kw => {
          const sortedRankings = (kw.rankings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          const latestRank = sortedRankings.length > 0 ? sortedRankings[0] : null;
          
          let websiteName = "General";
          if (kw.projectId) {
             const cycle = projectCycles.find(p => p._id.toString() === kw.projectId.toString());
             if (cycle && cycle.projectDuration?.length > 0) websiteName = cycle.projectDuration[0].projectName;
          }

          return { 
            keyword: kw.keyword, 
            page: latestRank ? latestRank.page : "-", 
            position: latestRank ? latestRank.position : "-",
            website: websiteName
          };
        });
      }
    } catch (e) { console.error("SEO Fetch Error:", e.message); }
  }

  const [ga4, gsc, gads, metaAds, metaPage] = await Promise.all([
    fetchAll(client.ga4PropertyIds,       (cid) => getGA4(cid, start, end)),
    fetchAll(client.gscSiteUrls,          (cid) => getGSC(cid, start, end, prevStart, prevEnd)),
    fetchAll(client.googleAdsCustomerIds, (cid) => getGoogleAds(cid, start, end, prevStart, prevEnd)),
    fetchAll(client.metaAdAccountIds,     (cid) => getMetaAds(cid, start, end, prevStart, prevEnd)),
    fetchAll(client.metaPageIds,          (cid) => getMetaPage(cid, start, end, prevStart, prevEnd)),
  ]);

  const report = await Report.create({
    clientId: id, periodType: body.periodType, periodStart: new Date(start), periodEnd: new Date(end),
    data: { client, ga4, gsc, gads, metaAds, metaPage, seoKeywords }, 
    createdBy: auth.user._id,
  });

  return Response.json({ reportId: report._id });
}
