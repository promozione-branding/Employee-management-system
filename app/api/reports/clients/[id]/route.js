// app/api/reports/clients/[id]/route.js
import { connectDB } from "@/lib/db";
import ReportClient from "@/models/admin/ReportClient";
import { requireReportAdmin } from "@/lib/reportingAuth";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Bad id" }, { status: 400 });
  const client = await ReportClient.findById(params.id).lean();
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ client });
}

export async function PATCH(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const body = await req.json();
  const client = await ReportClient.findByIdAndUpdate(params.id, { ...body, updatedBy: auth.user._id }, { new: true }).lean();
  return Response.json({ client });
}

export async function DELETE(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  await ReportClient.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}
