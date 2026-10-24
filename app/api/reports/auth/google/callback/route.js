// app/api/reports/auth/google/callback/route.js
import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import ReportSetting from "@/models/admin/ReportSetting";

export async function GET(req) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return Response.json({ error: "No code" }, { status: 400 });

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) throw new Error("No refresh token returned. Re-authorize after revoking access at myaccount.google.com/permissions");

    await connectDB();
    await ReportSetting.findOneAndUpdate(
      { key: "google_refresh_token" },
      { value: tokens.refresh_token, meta: { connectedAt: new Date() } },
      { upsert: true, new: true }
    );
    return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/reports?connected=google`);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
