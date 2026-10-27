export const dynamic = "force-dynamic";
import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";
import { getMetaPage } from "@/lib/meta";

export async function GET(req) {
  await connectDB();
  
  const setting = await MetaSetting.findOne({ key: "meta_access_token" }).lean();
  if (!setting?.value) {
    return Response.json({ error: "No token found in MongoDB." });
  }

  const url = new URL(req.url);
  const pageId = url.searchParams.get("pageId") || "836394063190352"; 
  const start = url.searchParams.get("start") || "2026-10-01";
  const end = url.searchParams.get("end") || "2026-10-27";

  try {
    console.log(`\n=== FETCHING DATA FOR PAGE: ${pageId} ===`);
    console.log(`Date Range: ${start} to ${end}`);
    
    // We are calling the exact same function the PDF uses
    const pageData = await getMetaPage(pageId, start, end, "2026-09-01", "2026-09-27");
    
    console.log("✅ SUCCESS! Data returned from Meta:", JSON.stringify(pageData, null, 2));

    return Response.json({
      success: true,
      page_data: pageData
    });
  } catch (error) {
    console.error("❌ FAILED! Error returned from Meta:", error.message);
    return Response.json({
      success: false,
      error: error.message
    });
  }
}
