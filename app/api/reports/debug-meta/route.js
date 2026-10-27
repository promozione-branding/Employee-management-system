export const dynamic = "force-dynamic";
import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";
import { getMetaPage, getMetaAds } from "@/lib/meta";

export async function GET(req) {
  await connectDB();
  
  // 1. Get the token from DB
  const setting = await MetaSetting.findOne({ key: "meta_access_token" }).lean();
  if (!setting?.value) {
    return Response.json({ error: "No token found in MongoDB. Click 'Connect Meta' first." });
  }

  // 2. Get the first page ID from the query string, or use a default
  const url = new URL(req.url);
  const pageId = url.searchParams.get("pageId") || "10482934823948"; 
  const start = url.searchParams.get("start") || "2026-10-01";
  const end = url.searchParams.get("end") || "2026-10-27";

  try {
    // 3. Fetch the data
    const pageData = await getMetaPage(pageId, start, end, "2026-09-01", "2026-09-27");
    
    return Response.json({
      success: true,
      token_used: setting.value.substring(0, 15) + "...",
      page_data: pageData
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      token_used: setting.value.substring(0, 15) + "..."
    });
  }
}
