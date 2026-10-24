// lib/meta.js
const META_VERSION = "v20.0";

function token() {
  const t = process.env.META_SYSTEM_USER_TOKEN;
  if (!t) throw new Error("META_SYSTEM_USER_TOKEN not set in .env");
  return t;
}

export async function getMetaAds(adAccountId, since, until) {
  const url =
    `https://graph.facebook.com/${META_VERSION}/${adAccountId}/insights?` +
    new URLSearchParams({
      access_token: token(),
      time_range: JSON.stringify({ since, until }),
      fields: "spend,impressions,clicks,ctr,cpc,reach,actions",
      level: "account",
    });
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`Meta Ads: ${json.error.message}`);
  return json.data?.[0] || null;
}

export async function getMetaPage(pageId, since, until) {
  const url =
    `https://graph.facebook.com/${META_VERSION}/${pageId}/insights?` +
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
