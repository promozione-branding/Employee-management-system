import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { NextResponse } from "next/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailerNew";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false }, { status: 400 });

    const { token } = await req.json();
    const proposal = await ProposalNew.findOne({ _id: id, acceptToken: token }).populate({ path: "clientId", select: "name email" });
    if (!proposal) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 404 });
    if (proposal.status === "accepted") return NextResponse.json({ success: true, message: "Already accepted" }, { status: 200 });

    proposal.status = "accepted";
    proposal.acceptedAt = new Date();
    proposal.acceptedByEmail = proposal.clientId?.email || "";
    await proposal.save();

    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: MAIL_FROM,
        to: proposal.clientId?.email,
        subject: `Welcome to Inquiry Bazaar — Proposal accepted`,
        html: `<p>Dear ${proposal.clientId?.name},</p><p>Thank you for accepting proposal <strong>${proposal.proposalNumber}</strong>. We're delighted to welcome you to <strong>Inquiry Bazaar Pvt Ltd</strong>.</p><p>Our team will reach out shortly.</p>`,
      });
    } catch (mailErr) { console.log("Thank-you mail error:", mailErr); }

    return NextResponse.json({ success: true, message: "Proposal accepted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
