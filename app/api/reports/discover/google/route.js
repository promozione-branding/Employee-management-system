// app/api/reports/discover/google/route.js
import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import ReportSetting from "@/models/admin/ReportSetting";
import { requireReportAdmin } from "@/lib/reportingAuth";

export async function GET(req) {
  const auth = await requireReportAdmin(req);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const setting = await ReportSetting.findOne({ key: "google_refresh_token" }).lean();
  if (!setting?.value) return Response.json({ error: "Google not connected" }, { status: 400 });

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2.setCredentials({ refresh_token: setting.value });

  const result = { ga4: [], gsc: [], googleAds: [] };

  try {
    const admin = google.analyticsadmin({ version: "v1beta", auth: oauth2 });
    const accounts = await admin.accounts.list();
    for (const acc of accounts.data.accounts || []) {
      try {
        const props = await admin.properties.list({ filter: `parent:${acc.name}` });
        for (const p of props.data.properties || []) {
          result.ga4.push({
            propertyId: p.name.split("/")[1],
            displayName: p.displayName,
            account: acc.displayName,
          });
        }
      } catch (e) {}
    }
  } catch (e) { result.ga4Error = e.message; }

  try {
    const sc = google.searchconsole({ version: "v1", auth: oauth2 });
    const sites = await sc.sites.list();
    result.gsc = (sites.data.siteEntry || []).map((s) => ({
      siteUrl: s.siteUrl, permissionLevel: s.permissionLevel,
    }));
  } catch (e) { result.gscError = e.message; }

  try {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      result.googleAdsError = "GOOGLE_ADS_DEVELOPER_TOKEN not configured";
    } else {
      const { GoogleAdsApi } = await import("google-ads-api");
      const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });
      const customer = client.Customer({
        customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
        refresh_token: setting.value,
      });
      const rows = await customer.query(`
        SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code
        FROM customer_client WHERE customer_client.manager = FALSE
      `);
      result.googleAds = rows.map((r) => ({
        customerId: String(r.customer_client.id),
        name: r.customer_client.descriptive_name,
        currency: r.customer_client.currency_code,
      }));
    }
  } catch (e) { result.googleAdsError = e.message; }

  return Response.json(result);
}
