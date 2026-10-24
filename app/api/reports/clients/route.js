// app/api/reports/clients/route.js
import { connectDB } from "@/lib/db";
import ReportClient from "@/models/admin/ReportClient";
import { requireReportAdmin } from "@/lib/reportingAuth";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const clients = await ReportClient.find().sort({ createdAt: -1 }).lean();
  return Response.json({ clients });
}

export async function POST(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const body = await req.json();
  if (!body.name) return Response.json({ error: "name required" }, { status: 400 });
  const client = await ReportClient.create({ ...body, createdBy: auth.user._id, updatedBy: auth.user._id });
  return Response.json({ client });
}
