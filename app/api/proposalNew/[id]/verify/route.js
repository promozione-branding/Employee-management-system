import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const { email, phoneLast7, token } = await req.json();

    const proposal = await ProposalNew.findOne({ _id: id, acceptToken: token })
      .populate({ path: "clientId", select: "email phone" });

    if (!proposal) {
      return NextResponse.json({ success: false, message: "Invalid link" }, { status: 404 });
    }

    const clientEmail = (proposal.clientId?.email || "").toLowerCase().trim();
    const inputEmail = (email || "").toLowerCase().trim();
    const clientPhone = String(proposal.clientId?.phone || "").replace(/\D/g, "");
    const inputPhone = String(phoneLast7).replace(/\D/g, "");

    if (clientEmail !== inputEmail) {
      return NextResponse.json({ success: false, message: "Email mismatch" }, { status: 400 });
    }
    
    if (!clientPhone.endsWith(inputPhone.slice(-7))) {
      return NextResponse.json({ success: false, message: "Phone mismatch" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Verified" }, { status: 200 });
  } catch (error) {
    console.log("verifyProposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
