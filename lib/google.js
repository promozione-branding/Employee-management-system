import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import ReportSetting from "@/models/admin/ReportSetting";

async function getOAuthClient() {
  await connectDB();
  const setting = await ReportSetting.findOne({ key: "google_refresh_token" }).lean();
  if (!setting?.value) throw new Error("Google not connected.");
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({ refresh_token: setting.value });
  return client;
}

export async function getGA4(propertyId, start, end) {
  const auth = await getOAuthClient();
  const analytics = google.analyticsdata({ version: "v1beta", auth });
  
  const resTotals = await analytics.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: start, endDate: end }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "conversions" }],
    },
  });

  const resDaily = await analytics.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    },
  });

  return { totals: resTotals.data, daily: resDaily.data?.rows || [] };
}

export async function getGSC(siteUrl, start, end) {
  const auth = await getOAuthClient();
  const sc = google.searchconsole({ version: "v1", auth });

  const totals = await sc.searchanalytics.query({
    siteUrl, requestBody: { startDate: start, endDate: end, dimensions: [] },
  });
  
  const daily = await sc.searchanalytics.query({
    siteUrl, requestBody: { startDate: start, endDate: end, dimensions: ["date"] },
  });

  return {
    totals: totals.data.rows?.[0] || null,
    daily: daily.data.rows || [],
  };
}

export async function getGoogleAds(customerId, start, end) {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) return { skipped: true, reason: "Token missing" };
  
  await connectDB();
  const refreshSetting = await ReportSetting.findOne({ key: "google_refresh_token" }).lean();
  const { GoogleAdsApi } = await import("google-ads-api");
  
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: customerId, login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    refresh_token: refreshSetting.value,
  });

  const rowsTotals = await customer.query(`
    SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM customer WHERE segments.date BETWEEN '${start}' AND '${end}'
  `);

  const rowsDaily = await customer.query(`
    SELECT segments.date, metrics.clicks
    FROM customer WHERE segments.date BETWEEN '${start}' AND '${end}'
  `);

  const m = rowsTotals?.[0]?.metrics || {};
  return {
    totals: {
      impressions: Number(m.impressions || 0), clicks: Number(m.clicks || 0),
      cost: Number(m.cost_micros || 0) / 1_000_000, conversions: Number(m.conversions || 0),
    },
    daily: rowsDaily.map(r => ({ date: r.segments.date, clicks: r.metrics.clicks }))
  };
}
