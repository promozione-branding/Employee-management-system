import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";

const META_VERSION = "v20.0";

async function getToken() {
  await connectDB();
  const setting = await MetaSetting.findOne({ key: "meta_access_token" }).lean();
  if (!setting?.value) throw new Error("Meta not connected. Visit /api/reports/auth/meta");
  return setting.value;
}

export async function getMetaAds(adAccountId, since, until) {
  const token = await getToken();
  const url = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
    new URLSearchParams({
      access_token: token,
      time_range: JSON.stringify({ since, until }),
      fields: "spend,impressions,clicks,reach",
      level: "account",
      time_increment: "1",
    });
  
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Meta Ads: ${json.error.message}`);

  let spend = 0, impressions = 0, clicks = 0, reach = 0;
  const daily = [];
  (json.data || []).forEach(day => {
    spend += Number(day.spend || 0);
    impressions += Number(day.impressions || 0);
    clicks += Number(day.clicks || 0);
    reach += Number(day.reach || 0);
    daily.push({ date: day.date_start, clicks: Number(day.clicks || 0) });
  });

  const campRes = await fetch(`https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` + new URLSearchParams({
    access_token: token, time_range: JSON.stringify({ since, until }),
    fields: "campaign_name,spend,impressions,clicks,reach,actions", level: "campaign",
  }));
  const campJson = await campRes.json();
  const campaigns = (campJson.data || []).map(c => {
    const conversions = c.actions?.find(a => a.action_type === "offsite_conversion.fb_pixel_lead" || a.action_type === "purchase")?.value || 0;
    return { name: c.campaign_name, spend: Number(c.spend || 0), impressions: Number(c.impressions || 0), clicks: Number(c.clicks || 0), reach: Number(c.reach || 0), results: Number(conversions) };
  }).filter(c => c.spend > 0);

  return { totals: { spend, impressions, clicks, reach }, daily, campaigns };
}

export async function getMetaPage(pageId, since, until) {
  const token = await getToken();
  const url = `https://graph.facebook.com/${META_VERSION}/${pageId}/insights?` +
    new URLSearchParams({ access_token: token, since, until, metric: "page_impressions,page_engaged_users,page_fan_adds" });
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Meta Page: ${json.error.message}`);
  return json.data || [];
}
