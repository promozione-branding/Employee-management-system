// app/api/reports/[id]/view/route.js
import { renderToBuffer } from "@react-pdf/renderer";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Report from "@/models/admin/Report";
import { requireReportAdmin } from "@/lib/reportingAuth";
import { ReportPDF } from "@/components/reports/ReportPDF";

export async function GET(req, { params }) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return new Response("Unauthorized", { status: 401 });
  
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return new Response("Bad id", { status: 400 });

  await connectDB();
  const report = await Report.findById(id).lean();
  if (!report) return new Response("Report not found", { status: 404 });

  try {
    // Generate the PDF buffer
    const pdf = await renderToBuffer(ReportPDF({ report }));
    
    // Return it as a file in the browser
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report-${id}.pdf"`,
      },
    });
  } catch (err) {
    return new Response(`Error generating PDF: ${err.message}`, { status: 500 });
  }
}
