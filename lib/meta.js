// lib/meta.js
const META_VERSION = "v20.0";

function token() {
  const t = process.env.META_SYSTEM_USER_TOKEN;
  if (!t) throw new Error("META_SYSTEM_USER_TOKEN not set in .env");
  return t;
}

export async function getMetaAds(adAccountId, since, until) {
  // 1. Fetch Daily Totals for the charts
  const urlTotals = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
    new URLSearchParams({
      access_token: token(),
      time_range: JSON.stringify({ since, until }),
      fields: "spend,impressions,clicks,reach",
      level: "account",
      time_increment: "1",
    });
  
  const resTotals = await fetch(urlTotals);
  const jsonTotals = await resTotals.json();
  if (jsonTotals.error) throw new Error(`Meta Ads: ${jsonTotals.error.message}`);

  let spend = 0, impressions = 0, clicks = 0, reach = 0;
  const daily = [];
  (jsonTotals.data || []).forEach(day => {
    spend += Number(day.spend || 0);
    impressions += Number(day.impressions || 0);
    clicks += Number(day.clicks || 0);
    reach += Number(day.reach || 0);
    daily.push({ date: day.date_start, clicks: Number(day.clicks || 0) });
  });

  // 2. Fetch Campaign Breakdown (The table you asked for)
  const urlCampaigns = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
    new URLSearchParams({
      access_token: token(),
      time_range: JSON.stringify({ since, until }),
      fields: "campaign_name,spend,impressions,clicks,reach,actions",
      level: "campaign",
    });
    
  const resCampaigns = await fetch(urlCampaigns);
  const jsonCampaigns = await resCampaigns.json();
  
  const campaigns = (jsonCampaigns.data || []).map(c => {
    // Extract conversions from the actions array if available
    const conversions = c.actions?.find(a => a.action_type === "offsite_conversion.fb_pixel_lead" || a.action_type === "purchase")?.value || 0;
    return {
      name: c.campaign_name,
      spend: Number(c.spend || 0),
      impressions: Number(c.impressions || 0),
      clicks: Number(c.clicks || 0),
      reach: Number(c.reach || 0),
      results: Number(conversions),
    };
  }).filter(c => c.spend > 0); // Only show campaigns that actually spent money

  return { totals: { spend, impressions, clicks, reach }, daily, campaigns };
}

export async function getMetaPage(pageId, since, until) {
  const url = `https://graph.facebook.com/${META_VERSION}/${pageId}/insights?` +
    new URLSearchParams({
      access_token: token(),
      since, until,
      metric: "page_impressions,page_engaged_users,page_fan_adds",
    });
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Meta Page: ${json.error.message}`);
  return json.data || [];
}
