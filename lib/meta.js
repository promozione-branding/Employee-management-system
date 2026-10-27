import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";

const META_VERSION = "v26.0";

async function getToken() {
  await connectDB();
  const setting = await MetaSetting.findOne({ key: "meta_access_token" }).lean();
  if (!setting?.value) throw new Error("Meta not connected. Please click 'Connect Meta' on the Reports page.");
  return setting.value;
}

// 👈 NEW HELPER: Automatically fetches the Page Token
async function getPageToken(userToken, pageId) {
  try {
    const url = `https://graph.facebook.com/${META_VERSION}/${pageId}?fields=access_token&access_token=${userToken}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.access_token) return json.access_token; // Return Page Token
    return userToken; // Fallback
  } catch (e) {
    return userToken;
  }
}

export async function getMetaAds(adAccountId, since, until, prevSince, prevUntil) {
  const token = await getToken();
  
  const fetchPeriod = async (s, u) => {
    const url = `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` + new URLSearchParams({ 
      access_token: token, 
      time_range: JSON.stringify({ since: s, until: u }), 
      fields: "spend,impressions,clicks,reach", 
      level: "account", 
      time_increment: "1" 
    });
    const res = await fetch(url); 
    const json = await res.json(); 
    if (json.error) throw new Error(json.error.message);
    
    let spend = 0, impressions = 0, clicks = 0, reach = 0;
    const daily = [];
    (json.data || []).forEach(day => {
      spend += Number(day.spend || 0); 
      impressions += Number(day.impressions || 0); 
      clicks += Number(day.clicks || 0); 
      reach += Number(day.reach || 0);
      daily.push({ date: day.date_start, clicks: Number(day.clicks || 0) });
    });
    return { totals: { spend, impressions, clicks, reach }, daily };
  };

  const current = await fetchPeriod(since, until);
  const previous = await fetchPeriod(prevSince, prevUntil);

  const campRes = await fetch(`https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` + new URLSearchParams({
    access_token: token, time_range: JSON.stringify({ since, until }), fields: "campaign_name,spend,clicks", level: "campaign",
  }));
  const campJson = await campRes.json();
  const campaigns = (campJson.data || []).map(c => ({ name: c.campaign_name, spend: Number(c.spend || 0), clicks: Number(c.clicks || 0) })).filter(c => c.spend > 0);

  return { totals: current.totals, prevTotals: previous.totals, daily: current.daily, campaigns };
}

export async function getMetaPage(pageId, since, until, prevSince, prevUntil) {
  const userToken = await getToken();
  
  // 👈 Get the specific Page Token for this Page ID
  const pageToken = await getPageToken(userToken, pageId);

  const fetchPeriod = async (s, u) => {
    const url = `https://graph.facebook.com/${META_VERSION}/${pageId}/insights?` + new URLSearchParams({ 
      access_token: pageToken, 
      since: s, 
      until: u, 
      metric: "page_media_view,page_post_engagements,page_follows",
      period: "day"
    });
    
    const res = await fetch(url); 
    const json = await res.json(); 
    
    if (json.error) {
      console.error(`Meta Page Error for ${pageId}:`, json.error.message);
      throw new Error(json.error.message);
    }
    
    let views = 0, interactions = 0, followers = 0; 
    const daily = [];
    
    (json.data || []).forEach(metric => {
      if (metric.name === "page_media_view" || metric.name === "page_impressions") {
        metric.values.forEach(v => { 
          views += Number(v.value || 0); 
          daily.push({ date: v.end_time, views: Number(v.value || 0) }); 
        });
      }
      if (metric.name === "page_post_engagements") {
        metric.values.forEach(v => { interactions += Number(v.value || 0); });
      }
      if (metric.name === "page_follows") {
        metric.values.forEach(v => { followers += Number(v.value || 0); });
      }
    });

    return { views, interactions, followers, daily };
  };

  const current = await fetchPeriod(since, until);
  const previous = await fetchPeriod(prevSince, prevUntil);

  return { ...current, prevTotals: previous };
}
