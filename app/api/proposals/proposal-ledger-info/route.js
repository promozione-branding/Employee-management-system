import { connectDB } from "@/lib/db";
import Proposal from "@/models/Proposal";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { proposalId } = await req.json();

    const findProposal = await Proposal.findById(proposalId).select("proposalNo tanNo totalAmount");

    if (!findProposal) {
      return NextResponse.json(
        {
          success: false,
          message: "Proposal not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: findProposal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
