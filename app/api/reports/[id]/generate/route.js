export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import ReportClient from "@/models/admin/ReportClient";
import Report from "@/models/admin/Report";
import { requireReportAdmin } from "@/lib/reportingAuth";
import mongoose from "mongoose";

export const maxDuration = 60;

function resolvePeriod(type, customStart, customEnd) {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  if (type === "weekly") start.setDate(start.getDate() - 7);
  else if (type === "monthly") start.setMonth(start.getMonth() - 1);
  else if (type === "3month") start.setMonth(start.getMonth() - 3);
  else if (type === "6month") start.setMonth(start.getMonth() - 6);
  else return { start: new Date(customStart), end: new Date(customEnd) };

  return { start, end };
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
  const { start, end } = resolvePeriod(body.periodType, body.start, body.end);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const client = await ReportClient.findById(id).lean();
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const { getGA4, getGSC, getGoogleAds } = await import("@/lib/google");
  const { getMetaAds } = await import("@/lib/meta");

  // 👈 FETCH SEO KEYWORDS WITH CORRECT PATHS
  let seoKeywords = [];
  let seoData = {};
  if (client.customerId) {
    try {
      const SeoSheet = (await import("@/models/employee/seoEmployee/SeoSheet")).default; 
      const Keyword = (await import("@/models/employee/seoEmployee/Keyword")).default; 
      
      const sheet = await SeoSheet.findOne({ clientId: client.customerId })
        .populate({ path: "keywords", model: Keyword })
        .lean();
      
      if (sheet && sheet.keywords) {
        seoKeywords = sheet.keywords.map(kw => {
          const sortedRankings = (kw.rankings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          const latestRank = sortedRankings.length > 0 ? sortedRankings[0] : null;
          return { 
            keyword: kw.keyword, 
            page: latestRank ? latestRank.page : "-", 
            position: latestRank ? latestRank.position : "-" 
          };
        });
      }
    } catch (e) { console.error("SEO Fetch Error:", e.message); }
  }

  const [ga4, gsc, gads, metaAds] = await Promise.all([
    fetchAll(client.ga4PropertyIds,       (cid) => getGA4(cid, startISO, endISO)),
    fetchAll(client.gscSiteUrls,          (cid) => getGSC(cid, startISO, endISO)),
    fetchAll(client.googleAdsCustomerIds, (cid) => getGoogleAds(cid, startISO, endISO)),
    fetchAll(client.metaAdAccountIds,     (cid) => getMetaAds(cid, startISO, endISO)),
  ]);

  const report = await Report.create({
    clientId: id, periodType: body.periodType, periodStart: start, periodEnd: end,
    data: { client, ga4, gsc, gads, metaAds, seoKeywords, seoData }, 
    createdBy: auth.user._id,
  });

  return Response.json({ reportId: report._id });
}
