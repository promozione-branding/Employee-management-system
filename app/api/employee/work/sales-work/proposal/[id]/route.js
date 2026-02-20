import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/Proposal";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const proposal = await Proposal.find({ salesExecutive: id })
      .select("clientId clientName clientCompany proposalNo")
      .populate({ path: "clientId", select: "name company email website" });

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: proposal,
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
