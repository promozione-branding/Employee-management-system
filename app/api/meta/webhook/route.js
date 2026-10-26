// app/api/meta/webhook/route.js
import { NextResponse } from "next/server";

// 1. Meta sends a GET request to verify the webhook URL
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // You must match this token in the Meta dashboard
  const VERIFY_TOKEN = process.env.META_WEBHOOK_SECRET || "promozione_meta_secret";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED by Meta");
    return new Response(challenge, { status: 200 });
  }

  console.error("❌ WEBHOOK VERIFICATION FAILED");
  return new Response("Forbidden", { status: 403 });
}

// 2. Meta sends POST requests here when a lead is generated
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 META WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    // Meta ALWAYS expects a 200 OK response, otherwise it will retry
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
