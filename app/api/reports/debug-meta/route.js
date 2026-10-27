export const dynamic = "force-dynamic";
import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";

export async function GET(req) {
  await connectDB();
  
  const setting = await MetaSetting.findOne({ key: "meta_access_token" }).lean();
  if (!setting?.value) return Response.json({ error: "No token in DB" });

  const url = new URL(req.url);
  const pageId = url.searchParams.get("pageId") || "102795055865301"; 
  
  // 1. Get Page Token
  const tokenRes = await fetch(`https://graph.facebook.com/v26.0/${pageId}?fields=access_token&access_token=${setting.value}`);
  const tokenJson = await tokenRes.json();
  const pageToken = tokenJson.access_token;

  if (!pageToken) return Response.json({ error: "Could not get Page Token", raw: tokenJson });

  // 2. Fetch Raw Insights using UNIX TIMESTAMPS (Meta's preferred format)
  const since = Math.floor(new Date("2026-09-01").getTime() / 1000);
  const until = Math.floor(new Date("2026-10-27").getTime() / 1000);

  const insightsUrl = `https://graph.facebook.com/v26.0/${pageId}/insights?metric=page_media_view,page_post_engagements,page_fan_adds&period=day&since=${since}&until=${until}&access_token=${pageToken}`;
  
  const res = await fetch(insightsUrl);
  const rawJson = await res.json();

  // 3. Return EVERYTHING to the browser
  return Response.json({
    success: true,
    page_id: pageId,
    url_called: insightsUrl,
    raw_meta_response: rawJson // 👈 THIS IS THE HOLY GRAIL
  });
}
