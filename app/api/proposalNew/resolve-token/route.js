// app/api/proposalNew/resolve-token/route.js

import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Token required" }, { status: 400 });
    }

    const proposal = await ProposalNew.findOne({ acceptToken: token })
      .select("_id proposalNumber status clientId")
      .populate({ path: "clientId", select: "name company" });

    if (!proposal) {
      return NextResponse.json({ success: false, message: "Invalid link" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: proposal }, { status: 200 });
  } catch (error) {
    console.log("resolveToken error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
