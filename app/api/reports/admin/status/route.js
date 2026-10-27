// app/api/reports/admin/status/route.js

import { connectDB } from "@/lib/db";
import ReportSetting from "@/models/admin/ReportSetting";
import MetaSetting from "@/models/admin/MetaSetting";
import { requireReportAdmin } from "@/lib/reportingAuth";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const google = await ReportSetting.findOne({ key: "google_refresh_token" }).lean();
  const meta = await MetaSetting.findOne({ key: "meta_access_token" }).lean();

  return Response.json({
    googleConnected: !!google?.value,
    metaConnected: !!meta?.value,
    googleAdsConfigured: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    resendConfigured: !!process.env.RESEND_API_KEY,
  });
}
