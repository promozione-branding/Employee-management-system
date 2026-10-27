import { requireReportAdmin } from "@/lib/reportingAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/reports/auth/meta/callback`;
  
  // Permissions needed for Ads and Pages
  const scope = "ads_read,read_insights,pages_read_engagement,business_management";

  const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return Response.redirect(url);
}
