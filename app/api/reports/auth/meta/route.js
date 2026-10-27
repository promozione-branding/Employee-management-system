import { requireReportAdmin } from "@/lib/reportingAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/reports/auth/meta/callback`;
  
  // 👈 ADDED read_insights and pages_show_list back in
  const scope = "ads_read,pages_read_engagement,pages_show_list,business_management,read_insights";

  const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return Response.redirect(url);
}
