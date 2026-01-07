import { connectDB } from "@/lib/db";
import Proposal from "@/models/Proposal";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const { ledgerEntry } = await req.json();

    const updateProposalLedgerEntry = await Proposal.findByIdAndUpdate(
      id,
      { ledgerEntry },
      { new: true }
    );

    if (!updateProposalLedgerEntry) {
      return NextResponse.json(
        { success: false, message: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposal ledger entry successfully",
        data: updateProposalLedgerEntry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error while update the proposal entry",
      },
      {
        status: 500,
      }
    );
  }
}
