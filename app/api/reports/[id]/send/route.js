// app/api/reports/[id]/send/route.js
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Report from "@/models/admin/Report";
import { requireReportAdmin } from "@/lib/reportingAuth";
import { ReportPDF } from "@/components/reports/ReportPDF";

export const maxDuration = 60;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Bad id" }, { status: 400 });

  await connectDB();
  const report = await Report.findById(params.id).lean();
  if (!report) return Response.json({ error: "Report not found" }, { status: 404 });
  if (report.sentAt) return Response.json({ error: "Already sent" }, { status: 409 });

  const client = report.data?.client;
  const toEmails = (client?.emails || []).filter(Boolean);
  if (toEmails.length === 0) return Response.json({ error: "No emails on client" }, { status: 400 });

  const label = report.periodType === "weekly" ? "Weekly" : report.periodType === "monthly" ? "Monthly" : "Performance";

  try {
    const pdf = await renderToBuffer(ReportPDF({ report }));
    await resend.emails.send({
      from: process.env.REPORT_FROM_EMAIL,
      to: toEmails,
      subject: `${label} Performance Report - ${client.name}`,
      html: `<p>Hi ${client.name},</p><p>Please find your ${label.toLowerCase()} performance report attached.</p><p>- Promozione Branding</p>`,
      attachments: [{
        filename: `${label.toLowerCase()}-report-${client.name.replace(/\s+/g, "-")}.pdf`,
        content: pdf.toString("base64"),
      }],
    });
    await Report.findByIdAndUpdate(params.id, { status: "sent", sentAt: new Date(), sentTo: toEmails.join(", ") });
    return Response.json({ ok: true, to: toEmails.join(", ") });
  } catch (err) {
    await Report.findByIdAndUpdate(params.id, { status: "failed", error: err.message });
    return Response.json({ error: err.message }, { status: 500 });
  }
}
