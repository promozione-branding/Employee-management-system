import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/Proposal";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { salesPersonId, clientId } = await params;

    const items = await Proposal.find({
      salesExecutive: salesPersonId,
      clientId,
    })
      .select(
        "clientName clientCompany dateOfProposal GSTIN totalAmount proposalNo proposalSent",
      )
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("GET API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
