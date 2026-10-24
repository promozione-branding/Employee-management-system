// app/api/reports/[id]/generate/route.js
import { connectDB } from "@/lib/db";
import ReportClient from "@/models/admin/ReportClient";
import Report from "@/models/admin/Report";
import { requireReportAdmin } from "@/lib/reportingAuth";
import { getGA4, getGSC, getGoogleAds } from "@/lib/google";
import { getMetaAds, getMetaPage } from "@/lib/meta";
import mongoose from "mongoose";

export const maxDuration = 60;

function resolvePeriod(periodType, customStart, customEnd) {
  const now = new Date();
  if (periodType === "weekly") {
    const end = new Date(now); const start = new Date(now); start.setDate(start.getDate() - 7);
    return { start, end };
  }
  if (periodType === "monthly") {
    return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0) };
  }
  return { start: new Date(customStart), end: new Date(customEnd) };
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
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Bad id" }, { status: 400 });

  await connectDB();
  const body = await req.json();
  const periodType = body.periodType || "weekly";
  const { start, end } = resolvePeriod(periodType, body.start, body.end);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const client = await ReportClient.findById(params.id).lean();
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const [ga4, gsc, gads, metaAds, metaPage] = await Promise.all([
    fetchAll(client.ga4PropertyIds,       (id) => getGA4(id, startISO, endISO)),
    fetchAll(client.gscSiteUrls,          (id) => getGSC(id, startISO, endISO)),
    fetchAll(client.googleAdsCustomerIds, (id) => getGoogleAds(id, startISO, endISO)),
    fetchAll(client.metaAdAccountIds,     (id) => getMetaAds(id, startISO, endISO)),
    fetchAll(client.metaPageIds,          (id) => getMetaPage(id, startISO, endISO)),
  ]);

  const report = await Report.create({
    clientId: params.id,
    periodType, periodStart: start, periodEnd: end,
    data: { client, ga4, gsc, gads, metaAds, metaPage },
    createdBy: auth.user._id,
  });

  return Response.json({ reportId: report._id, periodType, periodStart: start, periodEnd: end });
}
