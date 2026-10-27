// app/api/reports/auth/meta/callback/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MetaSetting from "@/models/admin/MetaSetting";

export async function GET(req) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/reports/auth/meta/callback`;

  try {
    // 1. Exchange code for a short-lived token
    const tokenRes = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) throw new Error(tokenData.error.message);

    // 2. Exchange short-lived token for a 60-day long-lived token
    const longRes = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`);
    const longData = await longRes.json();

    if (longData.error) throw new Error(longData.error.message);

    // 3. Save the 60-day token in MongoDB
    await connectDB();
    await MetaSetting.findOneAndUpdate(
      { key: "meta_access_token" },
      { 
        value: longData.access_token, 
        meta: { expiresIn: longData.expires_in, generatedAt: new Date() } 
      },
      { upsert: true, new: true }
    );

    return Response.redirect(`${process.env.NEXT_PUBLIC_URL}/reports?connected=meta`);
  } catch (err) {
    console.error("Meta Auth Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
