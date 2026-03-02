import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Proposal from "@/models/admin/proposal/Proposal";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const todayProposal = await Proposal.find({
      salesExecutive: id,
      proposalSent: true,
    })
      .select("clientName clientCompany dateOfProposal proposalNo")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!todayProposal) {
      return NextResponse.json(
        {
          message: "there is no proposal send",
          success: false,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: todayProposal,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
